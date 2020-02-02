
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
const chalk = require('chalk');

const settings = require('../config/settings.json');


export class FreeStuffBot extends Client {

  public commandHandler: CommandHandler;
  public databaseManager: DatabaseManager;
  public messageDistributor: MessageDistributor;

  constructor(props) {
    super(props);

    // fixReactionEvent(this);

    Util.init();
    
    WCP.init();

    MongoAdapter.connect(settings.mongodb.url)
      .catch(err => {
        console.error(err);
        WCP.send({ status_mongodb: '-Connection failed' });
      })
      .then(async () => {
        console.log('Connected to Mongo');
        WCP.send({ status_mongodb: '+Connected' });

        await Database.init();

        this.on('ready', () => {
          console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
          WCP.send({ status_discord: '+Connected' });
          this.user.setActivity('@Free Stuff ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​https://tude.ga/freestuff', { type: 'WATCHING' });
        });
    
        this.commandHandler = new CommandHandler(this);
        this.databaseManager = new DatabaseManager(this);
        this.messageDistributor = new MessageDistributor(this);

        this.login(settings.bot.token);
      });
  }

}


export const Core = new FreeStuffBot (
  {
    disabledEvents: [
      'TYPING_START',
    ]
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
