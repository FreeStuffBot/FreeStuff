"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const cron_1 = require("cron");
const chalk = require("chalk");
class DbStats {
    constructor() { }
    //
    static startMonitoring(bot) {
        new cron_1.CronJob('0 0 0 * * *', () => {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                const guildCount = bot.guilds.size;
                const guildMemberCount = bot.guilds.array().count(g => g.memberCount);
                console.log(chalk.gray(`Updated Stats. Guilds: ${bot.guilds.size}; Members: ${guildMemberCount}`));
                (yield this.usage).guilds.updateYesterday(guildCount, false);
                (yield this.usage).members.updateYesterday(guildMemberCount, false);
            }), 60000);
        }).start();
    }
    static get usage() {
        return new DbStatUsage().load();
    }
}
exports.DbStats = DbStats;
class DbStatUsage {
    //
    constructor() {
        this.raw = {};
    }
    //
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const c = yield database_1.default
                .collection('stats-usage')
                .find({})
                .toArray();
            for (const temp of c)
                this.raw[temp._id] = temp.value;
            return this;
        });
    }
    get guilds() {
        return new DbStatGraph('stats-usage', { _id: 'guilds' }, this.raw['guilds'], this.raw);
    }
    get members() {
        return new DbStatGraph('stats-usage', { _id: 'members' }, this.raw['members'], this.raw);
    }
}
exports.DbStatUsage = DbStatUsage;
class DbStatGraph {
    constructor(_collectionname, _dbquery, raw, _fullraw) {
        this._collectionname = _collectionname;
        this._dbquery = _dbquery;
        this.raw = raw;
        this._fullraw = _fullraw;
    }
    //
    get today() {
        if (!this.raw)
            return 0;
        return this.raw[getDayId()] || 0;
    }
    update(dayId, value, delta) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dayId < 0)
                return;
            if (this.raw) {
                let obj = {};
                obj[`value.${dayId}`] = value;
                if (delta)
                    obj = { '$inc': obj };
                else
                    obj = { '$set': obj };
                if (dayId > this.raw.length) {
                    if (!obj['$set'])
                        obj['$set'] = {};
                    while (dayId-- > this.raw.length)
                        obj['$set'][`value.${dayId}`] = 0;
                }
                return yield database_1.default
                    .collection(this._collectionname)
                    .updateOne(this._dbquery, obj);
            }
            else {
                const parentExists = Object.keys(this._fullraw).length > 0;
                const obj = parentExists ? {} : this._dbquery;
                obj.value = [];
                for (let i = 0; i < dayId; i++)
                    obj.value.push(0);
                obj.value.push(value);
                if (parentExists) {
                    return yield database_1.default
                        .collection(this._collectionname)
                        .updateOne(this._dbquery, { '$set': obj });
                }
                else {
                    this._fullraw.value = obj;
                    return yield database_1.default
                        .collection(this._collectionname)
                        .insertOne(obj);
                }
            }
        });
    }
    updateToday(value, delta = true) {
        this.update(getDayId(), value, delta);
    }
    updateYesterday(value, delta = true) {
        this.update(getDayId() - 1, value, delta);
    }
}
exports.DbStatGraph = DbStatGraph;
function getDayId() {
    const now = new Date();
    const start = new Date(2020, 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return day - 1; // index 0 on 1st january
}
//# sourceMappingURL=dbStats.js.map