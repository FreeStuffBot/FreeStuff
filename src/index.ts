
import { Client, Guild, User } from "discord.js";
import WCP from './thirdparty/wcp/wcp';
import * as fs from 'fs';
import { loadavg } from 'os';
import { Long } from 'mongodb';
import MongoAdapter from "./database/mongo.adapter";
import Database from "./database/database";
import { Util } from "./util/util";
import CommandHandler from "./bot/commandhandler";
import DatabaseManager from "./bot/databasemanager";
import MessageDistributor from "./bot/messagedistributor";
import AdminCommandHandler from "./bot/admincommandhandler";
import { DbStats } from "./database/dbstats";
import { logVersionDetails } from "./util/gitParser";
import WebScraper from "./web_scraper/scraper";
import * as chalk from "chalk";
import * as DBL from "dblapi.js";
import Pastebin from "./thirdparty/pastebin/pastebin";

const settings = require('../config/settings.json');


export class FreeStuffBot extends Client {

  public commandHandler: CommandHandler;
  public databaseManager: DatabaseManager;
  public messageDistributor: MessageDistributor;
  public adminCommandHandler: AdminCommandHandler;
  
  public dbl: any;

  constructor(options) {
    super(options);

    // fixReactionEvent(this);

    Util.init();
    WCP.init();
    // Pastebin.init();

    MongoAdapter.connect(settings.mongodb.url)
      .catch(err => {
        console.error(err);
        WCP.send({ status_mongodb: '-Connection failed' });
      })
      .then(async () => {
        console.log('Connected to Mongo');
        WCP.send({ status_mongodb: '+Connected' });

        logVersionDetails();

        await Database.init();
    
        this.commandHandler = new CommandHandler(this);
        this.databaseManager = new DatabaseManager(this);
        this.messageDistributor = new MessageDistributor(this);
        this.adminCommandHandler = new AdminCommandHandler(this);

        DbStats.startMonitoring(this);

        this.dbl = new DBL(settings.thirdparty.topgg.apitoken, this);

        this.on('ready', () => {
          console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
          WCP.send({ status_discord: '+Connected' });
          this.user.setActivity('@FreeStuff ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​https://tude.ga/freestuff', { type: 'WATCHING' });

          WebScraper.init();

          // WebScraper.fetch('https://www.epicgames.com/store/de/product/detroit-become-human/home').then(d => {
          //   this.messageDistributor.distribute(d);
          // });
        });

        this.login(settings.bot.token);
      });
  }

}


export const Core = new FreeStuffBot (
  {
    disabledEvents: [
      // 'READY',
      'RESUMED',
      'GUILD_SYNC',
      // 'GUILD_CREATE',
      // 'GUILD_DELETE',
      'GUILD_UPDATE',
      'GUILD_MEMBER_ADD',
      'GUILD_MEMBER_REMOVE',
      'GUILD_MEMBER_UPDATE',
      'GUILD_MEMBERS_CHUNK',
      'GUILD_INTEGRATIONS_UPDATE',
      'GUILD_ROLE_CREATE',
      'GUILD_ROLE_DELETE',
      'GUILD_ROLE_UPDATE',
      'GUILD_BAN_ADD',
      'GUILD_BAN_REMOVE',
      'CHANNEL_CREATE',
      'CHANNEL_DELETE',
      'CHANNEL_UPDATE',
      'CHANNEL_PINS_UPDATE',
      // 'MESSAGE_CREATE',
      'MESSAGE_DELETE',
      'MESSAGE_UPDATE',
      'MESSAGE_DELETE_BULK',
      'MESSAGE_REACTION_ADD',
      'MESSAGE_REACTION_REMOVE',
      'MESSAGE_REACTION_REMOVE_ALL',
      'USER_UPDATE',
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
  }
);


function fixReactionEvent(bot: FreeStuffBot) {
  const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
  }

  bot.on('raw', async (event: Event) => {
    const ev: any = event;
    if (!events.hasOwnProperty(ev.t)) return
    const data = ev.d;
    const user: User = bot.users.get(data.user_id);
    const channel: any = bot.channels.get(data.channel_id) || await user.createDM();
    if (channel.messages.has(data.message_id)) return;
    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    const reaction = message.reactions.get(emojiKey);
    bot.emit(events[ev.t], reaction, user);
  });
}
