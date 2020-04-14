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
const index_1 = require("../index");
const database_1 = require("../database/database");
const mongodb_1 = require("mongodb");
class DatabaseManager {
    constructor(bot) {
        bot.on('ready', () => __awaiter(this, void 0, void 0, function* () {
            // Check if any guild is not in the database yet
            // Might happen when someone adds the bot while it's offline
            // Same with leaving guilds and removing them from the db then
            let dbGuilds = yield database_1.default.collection('guilds').find({}).toArray();
            for (let guild of bot.guilds.values()) {
                if (!dbGuilds.find(g => g._id === guild.id))
                    this.addGuild(guild);
            }
            for (let guild of dbGuilds) {
                if (!bot.guilds.get(guild._id))
                    this.removeGuild(guild._id);
            }
        }));
        bot.on('guildCreate', guild => {
            this.addGuild(guild);
        });
        bot.on('guildDelete', guild => {
            this.removeGuild(guild.id);
        });
    }
    addGuild(guild) {
        database_1.default
            .collection('guilds')
            .insertOne({
            _id: guild.id,
            channel: undefined,
            role: undefined,
            price: 3,
            settings: 0
        });
        // settings: _ _ _ _______
        // 0 0 0 0 0 0 0 0 0 0 0 0
        //           | | |  theme
        //           | | currency (on = usd, off = eur)
        //           | react with :free: emoji
        //           show trash games? 0 is no, 1 is yes
        //
    }
    removeGuild(guildid) {
        database_1.default
            .collection('guilds')
            .deleteOne({ _id: guildid });
    }
    getGuildData(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            let obj = yield database_1.default
                .collection('guilds')
                .findOne({ _id: guild.id })
                .catch(console.error);
            if (!obj)
                return undefined;
            return this.parseGuildData(obj);
        });
    }
    parseGuildData(dbObject) {
        if (!dbObject)
            return undefined;
        return {
            id: dbObject._id,
            channel: dbObject.channel,
            channelInstance: dbObject.channel
                ? index_1.Core.guilds.get(dbObject._id).channels.get(dbObject.channel.toString())
                : undefined,
            settings: dbObject.settings,
            mentionRole: dbObject.role,
            mentionRoleInstance: dbObject.role
                ? (dbObject.role == 1
                    ? index_1.Core.guilds.get(dbObject._id).defaultRole
                    : index_1.Core.guilds.get(dbObject._id).roles.get(dbObject.role.toString()))
                : undefined,
            currency: (dbObject.settings & 0b10000) == 0 ? 'euro' : 'usd',
            react: (dbObject.settings & 0b100000) != 0,
            trashGames: (dbObject.settings & 0b1000000) != 0,
            theme: dbObject.settings & 0b1111,
            price: dbObject.price
        };
    }
    changeSetting(guild, current, setting, value) {
        let out = {};
        switch (setting) {
            case 'channel':
                out['channel'] = mongodb_1.Long.fromString(value);
                break;
            case 'roleMention':
                out['role'] = value ? mongodb_1.Long.fromString(value) : null;
                break;
            case 'theme':
                out['settings'] = ((current.settings >> 4) << 4) + value;
                break;
            case 'currency':
                out['settings'] = (current.settings | 0b10000) ^ (value ? 0 : 0b10000);
                break;
            case 'react':
                out['settings'] = (current.settings | 0b100000) ^ (value ? 0 : 0b100000);
                break;
            case 'trash':
                out['settings'] = (current.settings | 0b1000000) ^ (value ? 0 : 0b1000000);
                break;
            case 'price':
                out['price'] = value;
                break;
        }
        database_1.default
            .collection('guilds')
            .updateOne({ _id: guild.id }, { '$set': out });
    }
}
exports.default = DatabaseManager;
//# sourceMappingURL=databaseManager.js.map