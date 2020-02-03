import Database, { dbcollection } from "./database";
import { RequestHandler } from "discord.js";
import { FreeStuffBot } from "index";
import { CronJob } from "cron";
const chalk = require('chalk');


export class DbStats {

    private constructor() {}

    public static startMonitoring(bot: FreeStuffBot) {
        new CronJob('0 0 0 * * *', () => {
            setTimeout(async () => {
                let guildCount = bot.guilds.size;
                let guildMemberCount = bot.guilds.array().count(g => g.memberCount);
                console.log(chalk.gray(`Updated Stats. Guilds: ${bot.guilds.size}; Members: ${guildMemberCount}`));
                (await this.usage).guilds.updateYesterday(guildCount, false);
                (await this.usage).members.updateYesterday(guildMemberCount, false);
            }, 60_000);
        }).start();
    }

    static get usage(): Promise<DbStatUsage> {
        return new DbStatUsage().load();
    }

}

export class DbStatUsage {

    public readonly raw: {[key: string ]: number[]} = {};

    constructor(
    ) {}

    async load(): Promise<this> {
        let c = await Database
            .collection('stats-usage')
            .find({ })
            .toArray();
        for (let temp of c)
            this.raw[temp._id] = temp.value;
        return this;
    }

    get guilds(): DbStatGraph {
        return new DbStatGraph('stats-usage', {_id:'guilds'}, this.raw['guilds'], this.raw);
    }

    get members(): DbStatGraph {
        return new DbStatGraph('stats-usage', {_id:'members'}, this.raw['members'], this.raw);
    }

}

export class DbStatGraph {

    constructor(
        private _collectionname: string,
        private _dbquery: any,
        public readonly raw: number[],
        private _fullraw: any
    ) {}

    public get today(): number {
        if (!this.raw) return 0;
        return this.raw[getDayId()] || 0;
    }

    public async update(dayId: number, value: number, delta: boolean): Promise<any> {
        if (dayId < 0) return;
        if (this.raw) {
            let obj = { };
            obj[`value.${dayId}`] = value
            if (delta) obj = { '$inc': obj };
            else obj = { '$set': obj };
            if (dayId > this.raw.length) {
                if (!obj['$set'])
                    obj['$set'] = {};
                while (dayId-- > this.raw.length)
                    obj['$set'][`value.${dayId}`] = 0;
            }
            return await Database
                .collection(this._collectionname as dbcollection)
                .updateOne(this._dbquery, obj);
        } else {
            let parentExists = Object.keys(this._fullraw).length > 0;
            let obj = parentExists ? {} : this._dbquery;
            obj.value = [];
            for (let i = 0; i < dayId; i++)
                obj.value.push(0);
            obj.value.push(value);
            if (parentExists) {
                return await Database
                    .collection(this._collectionname as dbcollection)
                    .updateOne(this._dbquery, { '$set': obj });
            } else {
                this._fullraw.value = obj;
                return await Database
                    .collection(this._collectionname as dbcollection)
                    .insertOne(obj);
            }
        }
    }

    public updateToday(value: number, delta: boolean = true) {
        this.update(getDayId(), value, delta);
    }

    public updateYesterday(value: number, delta: boolean = true) {
        this.update(getDayId() - 1, value, delta);
    }

}

function getDayId(): number {
    let now = new Date();
    let start = new Date(2020, 0, 0);
    let diff = now.getTime() - start.getTime();
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);
    return day - 1; // index 0 on 1st january
}