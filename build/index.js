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
const CommandHandler_1 = require("./bot/CommandHandler");
const DatabaseManager_1 = require("./bot/DatabaseManager");
const MessageDistributor_1 = require("./bot/MessageDistributor");
const AdminCommandHandler_1 = require("./bot/AdminCommandHandler");
const dbstats_1 = require("./database/dbstats");
const gitParser_1 = require("./util/gitParser");
const scraper_1 = require("./web_scraper/scraper");
const chalk = require("chalk");
const DBL = require("dblapi.js");
const dotenv_1 = require("dotenv");
const settings = require('../config/settings.json');
class FreeStuffBot extends discord_js_1.Client {
    constructor(options) {
        super(options);
        dotenv_1.config();
        this.devMode = process.env.ENVIRONMENT == 'dev';
        if (this.devMode) {
            console.log(chalk.bgRedBright.black(' RUNNING DEV MODE '));
        }
        // fixReactionEvent(this);
        util_1.Util.init();
        wcp_1.default.init(this.devMode);
        // Pastebin.init();
        mongo_adapter_1.default.connect(settings.mongodb.url)
            .catch(err => {
            console.error(err);
            wcp_1.default.send({ status_mongodb: '-Connection failed' });
        })
            .then(() => __awaiter(this, void 0, void 0, function* () {
            console.log('Connected to Mongo');
            wcp_1.default.send({ status_mongodb: '+Connected' });
            gitParser_1.logVersionDetails();
            yield database_1.default.init();
            this.commandHandler = new CommandHandler_1.default(this);
            this.databaseManager = new DatabaseManager_1.default(this);
            this.messageDistributor = new MessageDistributor_1.default(this);
            this.adminCommandHandler = new AdminCommandHandler_1.default(this);
            dbstats_1.DbStats.startMonitoring(this);
            if (!this.devMode) {
                this.dbl = new DBL(settings.thirdparty.topgg.apitoken, this);
            }
            this.on('ready', () => {
                console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
                wcp_1.default.send({ status_discord: '+Connected' });
                this.user.setActivity('@FreeStuff ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​https://tude.ga/freestuff', { type: 'WATCHING' });
                scraper_1.default.init();
                // WebScraper.fetch('https://store.steampowered.com/app/442070/Drawful_2/').then(d => {
                //   // this.messageDistributor.distribute(d);
                //   console.log(d);
                // });
            });
            this.login(settings.bot.token);
        }));
    }
}
exports.FreeStuffBot = FreeStuffBot;
exports.Core = new FreeStuffBot({
    disabledEvents: [
        // 'READY',
        'RESUMED',
        'GUILD_SYNC',
        // 'GUILD_CREATE',
        // 'GUILD_DELETE',
        // 'GUILD_UPDATE',
        'GUILD_MEMBER_ADD',
        'GUILD_MEMBER_REMOVE',
        // 'GUILD_MEMBER_UPDATE',
        'GUILD_MEMBERS_CHUNK',
        'GUILD_INTEGRATIONS_UPDATE',
        // 'GUILD_ROLE_CREATE',
        // 'GUILD_ROLE_DELETE',
        // 'GUILD_ROLE_UPDATE',
        'GUILD_BAN_ADD',
        'GUILD_BAN_REMOVE',
        // 'CHANNEL_CREATE',
        // 'CHANNEL_DELETE',
        // 'CHANNEL_UPDATE',
        'CHANNEL_PINS_UPDATE',
        // 'MESSAGE_CREATE',
        'MESSAGE_DELETE',
        'MESSAGE_UPDATE',
        'MESSAGE_DELETE_BULK',
        'MESSAGE_REACTION_ADD',
        'MESSAGE_REACTION_REMOVE',
        'MESSAGE_REACTION_REMOVE_ALL',
        // 'USER_UPDATE',
        'USER_NOTE_UPDATE',
        'USER_SETTINGS_UPDATE',
        'PRESENCE_UPDATE',
        'VOICE_STATE_UPDATE',
        'TYPING_START',
        'VOICE_SERVER_UPDATE',
        'RELATIONSHIP_ADD',
        'RELATIONSHIP_REMOVE',
        'WEBHOOKS_UPDATE'
    ],
    messageSweepInterval: 5,
    messageCacheLifetime: 5,
    messageCacheMaxSize: 5,
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