import Database, { dbcollection } from "./database";
import { RequestHandler } from "discord.js";


export class DbStats {

    private constructor() {}

    static getCommand(name: string): Promise<DbStatCommand> {
        return new Promise(async (resolve, reject) => resolve(await new DbStatCommand(name).load()));
    }

}

export class DbStatCommand {

    public readonly raw: {[key: string ]: number[]} = {};

    constructor(
        public readonly name: string
    ) {}

    async load(): Promise<this> {
        let c = await Database
            .collection('stats')
            .findOne({ _id: this.name });
        for (let temp in c)
            this.raw[temp] = c[temp];
        return this;
    }

    get calls(): DbStatGraph {
        return new DbStatGraph('stats-commands', {_id:this.name}, 'calls', this.raw['calls'], this.raw);
    }

    get executions(): DbStatGraph {
        return new DbStatGraph('stats-commands', {_id:this.name}, 'executions', this.raw['executions'], this.raw);
    }

}

export class DbStatGraph {

    constructor(
        private _collectionname: string,
        private _dbquery: any,
        private _objectid: string,
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
            obj[`${this._objectid}.${dayId}`] = value
            if (delta) obj = { '$inc': obj };
            else obj = { '$set': obj };
            if (dayId > this.raw.length) {
                if (!obj['$set'])
                    obj['$set'] = {};
                while (dayId-- > this.raw.length)
                    obj['$set'][`${this._objectid}.${dayId}`] = 0;
            }
            return await Database
                .collection(this._collectionname as dbcollection)
                .updateOne(this._dbquery, obj);
        } else {
            let parentExists = Object.keys(this._fullraw).length > 0;
            let obj = parentExists ? {} : this._dbquery;
            obj[this._objectid] = [];
            for (let i = 0; i < dayId; i++)
                obj[this._objectid].push(0);
            obj[this._objectid].push(value);
            if (parentExists) {
                return await Database
                    .collection(this._collectionname as dbcollection)
                    .updateOne(this._dbquery, { '$set': obj });
            } else {
                this._fullraw[this._objectid] = obj;
                return await Database
                    .collection(this._collectionname as dbcollection)
                    .insertOne(obj);
            }
        }
    }

    public updateToday(value: number, delta: boolean = true) {
        this.update(getDayId(), value, delta);
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