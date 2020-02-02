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
const discord_js_1 = require("discord.js");
const wcp_1 = require("./thirdparty/wcp/wcp");
const mongo_adapter_1 = require("./database/mongo.adapter");
const database_1 = require("./database/database");
const util_1 = require("./util/util");
const commandhandler_1 = require("./bot/commandhandler");
const databasemanager_1 = require("./bot/databasemanager");
const messagedistributor_1 = require("./bot/messagedistributor");
const chalk = require('chalk');
const settings = require('../config/settings.json');
class FreeStuffBot extends discord_js_1.Client {
    constructor(props) {
        super(props);
        // fixReactionEvent(this);
        util_1.Util.init();
        wcp_1.default.init();
        mongo_adapter_1.default.connect(settings.mongodb.url)
            .catch(err => {
            console.error(err);
            wcp_1.default.send({ status_mongodb: '-Connection failed' });
        })
            .then(() => __awaiter(this, void 0, void 0, function* () {
            console.log('Connected to Mongo');
            wcp_1.default.send({ status_mongodb: '+Connected' });
            yield database_1.default.init();
            this.on('ready', () => {
                console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
                wcp_1.default.send({ status_discord: '+Connected' });
                this.user.setActivity('@Free Stuff ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​https://tude.ga/freestuff', { type: 'WATCHING' });
            });
            this.commandHandler = new commandhandler_1.default(this);
            this.databaseManager = new databasemanager_1.default(this);
            this.messageDistributor = new messagedistributor_1.default(this);
            this.login(settings.bot.token);
        }));
    }
}
exports.FreeStuffBot = FreeStuffBot;
exports.Core = new FreeStuffBot({
    disabledEvents: [
        'TYPING_START',
    ]
});
function fixReactionEvent(bot) {
    const events = {
        MESSAGE_REACTION_ADD: 'messageReactionAdd',
        MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
    };
    bot.on('raw', (event) => __awaiter(this, void 0, void 0, function* () {
        const ev = event;
        if (!events.hasOwnProperty(ev.t))
            return;
        const data = ev.d;
        const user = bot.users.get(data.user_id);
        const channel = bot.channels.get(data.channel_id) || (yield user.createDM());
        if (channel.messages.has(data.message_id))
            return;
        const message = yield channel.fetchMessage(data.message_id);
        const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
        const reaction = message.reactions.get(emojiKey);
        bot.emit(events[ev.t], reaction, user);
    }));
}
//# sourceMappingURL=index.js.map