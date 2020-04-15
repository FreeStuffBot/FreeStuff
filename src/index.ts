
import { Client, User } from "discord.js";
import WCP from './thirdparty/wcp/wcp';
import MongoAdapter from "./database/mongo-adapter";
import Database from "./database/database";
import { Util } from "./util/util";
import CommandHandler from "./bot/command-handler";
import DatabaseManager from "./bot/database-manager";
import MessageDistributor from "./bot/message-distributor";
import AdminCommandHandler from "./bot/admin-command-handler";
import { DbStats } from "./database/dbStats";
import { logVersionDetails } from "./util/git-parser";
import * as chalk from "chalk";
import * as DBL from "dblapi.js";
import { config as loadDotEnv } from "dotenv";

const settings = require('../config/settings.json');


export class FreeStuffBot extends Client {

  public commandHandler: CommandHandler;
  public databaseManager: DatabaseManager;
  public messageDistributor: MessageDistributor;
  public adminCommandHandler: AdminCommandHandler;
  
  public dbl: any;
  public readonly devMode;

  constructor(options) {
    super(options);
    loadDotEnv();

    // const data = {
    //   store: 'Steam',
    //   name: 'Cool Game',
    //   'oldprice.eur': '2.99€',
    //   trash: false,
    //   'steam.subids': '4124 24124'
    // }

    // function test(a: string) {
    //   console.log(a);
    //   console.log(parseAstr(a, data));
    //   console.log(' ');
    // }

    // test('=name= is free on =store=');
    // test('The game =name= costed =oldprice.eur= before!');
    // test('{trash? YES}{NO}');
    // test('This game {trash? is}{is not} trash!');
    // test('{steam.subids? =steam.subids=}{Game not from Steam}');
    // test('{abc? ABC!}{def? DEF}{store? STORE!}{xyz? XYZ}');
    // test('{trash?}{Ok boomerino}');
    // test('{ok}');

    // WebScraper.init();

    // // WebScraper.fetch('https://store.steampowered.com/app/680360/Regions_Of_Ruin/').then(d => {
    // //   console.log(d);
    // // });
    // // SteamdbScraper.fetchFreeGames().then(console.log);
    // (async () => {
    //   SteamdbScraper.fetchSubids('822540').then(console.log)
    //   // let ids = await SteamdbScraper.fetchFreeGames();
    //   // let subids = ids.map(SteamdbScraper.fetchSubids).map(async a => await a);
    //   // let flatted = Array.prototype.concat.apply([], subids);
    //   // console.log(flatted);
    // })();

    // return;

    this.devMode = process.env.ENVIRONMENT == 'dev';

    if (this.devMode) {
      console.log(chalk.bgRedBright.black(' RUNNING DEV MODE '));
    }

    logVersionDetails();

    // fixReactionEvent(this);

    Util.init();
    WCP.init(false);
    // Pastebin.init();

    MongoAdapter.connect(settings.mongodb.url)
      .catch(err => {
        console.error(err);
        WCP.send({ status_mongodb: '-Connection failed' });
      })
      .then(async () => {
        console.log('Connected to Mongo');
        WCP.send({ status_mongodb: '+Connected' });

        await Database.init();
    
        this.commandHandler = new CommandHandler(this);
        this.databaseManager = new DatabaseManager(this);
        this.messageDistributor = new MessageDistributor(this);
        this.adminCommandHandler = new AdminCommandHandler(this);

        DbStats.startMonitoring(this);

        if (!this.devMode) {
          this.dbl = new DBL(settings.thirdparty.topgg.apitoken, this);
        }

        this.on('ready', () => {
          console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
          WCP.send({ status_discord: '+Connected' });
          this.user.setActivity('@FreeStuff ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​https://freestuffbot.xyz/', { type: 'WATCHING' });

          // WebScraper.fetch('https://store.steampowered.com/app/442070/Drawful_2/').then(d => {
          //   // this.messageDistributor.distribute(d);
          //   console.log(d);
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
      // 'RESUMED',
      // 'GUILD_SYNC',
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
