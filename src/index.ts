import { config as loadDotEnv } from "dotenv";
loadDotEnv();
export const config = require('../config.js');


import { Client, User, ClientOptions } from "discord.js";
import WCP from './thirdparty/wcp/wcp';
import MongoAdapter from "./database/mongo-adapter";
import Database from "./database/database";
import { Util } from "./util/util";
import CommandHandler from "./bot/command-handler";
import DatabaseManager from "./bot/database-manager";
import MessageDistributor from "./bot/message-distributor";
import AdminCommandHandler from "./bot/admin-command-handler";
import DataFetcher from "./bot/data-fetcher";
import Sharder from "./bot/sharder";
import { DbStats } from "./database/db-stats";
import { logVersionDetails } from "./util/git-parser";
import * as chalk from "chalk";
import * as DBL from "dblapi.js";
import ParseArgs from "./util/parse-args";


export class FreeStuffBot extends Client {

  public commandHandler: CommandHandler;
  public databaseManager: DatabaseManager;
  public messageDistributor: MessageDistributor;
  public adminCommandHandler: AdminCommandHandler;
  public dataFetcher: DataFetcher;
  public sharder: Sharder;
  
  public dbl: any;
  public readonly devMode: boolean;
  public readonly singleShard: boolean;

  constructor(options: ClientOptions, params: any) {
    super(options);

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

    this.devMode = process.env.NODE_ENV == 'dev';
    this.singleShard = !!params.noShard;

    if (this.devMode) {
      console.log(chalk.bgRedBright.black(' RUNNING DEV MODE '));
    }

    logVersionDetails();

    // fixReactionEvent(this);

    Util.init();
    WCP.init(false);

    MongoAdapter.connect(config.mongodb.url)
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
        this.dataFetcher = new DataFetcher(this);
        this.sharder = new Sharder(this);

        DbStats.startMonitoring(this);

        if (!this.devMode) {
          this.dbl = new DBL(config.thirdparty.topgg.apitoken, this);
        }

        this.on('ready', () => {
          console.log(chalk`Bot ready! Logged in as {yellowBright ${this.user.tag}} {gray (${params.noSharding ? 'No Sharding' : `Shard ${options.shardId} / ${options.shardCount}`})}`);
          WCP.send({ status_discord: '+Connected' });
          this.user.setActivity('@FreeStuff ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​https://freestuffbot.xyz/', { type: 'WATCHING' });
        });

        this.login(config.bot.token);
      });
  }

}


const params = ParseArgs.parse(process.argv);

const sharding = !params.noSharding;
if (sharding && (!params.shardCount || !params.shardId)) {
  console.error(chalk.red`Missing --shardCount or --shardId`);
  process.exit(-1);
}
const shardCount = parseInt(params.shardCount as string);
const shardId = parseInt(params.shardId as string);
if (sharding && (!params.shardCount || !params.shardId)) {
  console.error(chalk.red`Invalid --shardCount or --shardId`);
  process.exit(-1);
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
    shardCount: sharding ? shardCount : 1,
    shardId: sharding ? shardId : 0
  },
  params
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
