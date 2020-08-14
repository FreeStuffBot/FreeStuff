import { config as loadDotEnv } from "dotenv";
loadDotEnv();
export const config = require('../config.js');


import { Client, ClientOptions } from "discord.js";
import MongoAdapter from "./database/mongo-adapter";
import Database from "./database/database";
import { Util } from "./util/util";
import CommandHandler from "./bot/command-handler";
import DatabaseManager from "./bot/database-manager";
import MessageDistributor from "./bot/message-distributor";
import AdminCommandHandler from "./bot/admin-command-handler";
import DataFetcher from "./bot/data-fetcher";
import Sharder from "./bot/sharder";
import LanguageManager from "./bot/language-manager";
import Localisation from "./bot/localisation";
import { DbStats } from "./database/db-stats";
import { logVersionDetails } from "./util/git-parser";
import * as chalk from "chalk";
import * as DBL from "dblapi.js";
import ParseArgs from "./util/parse-args";
import SentryManager from "./thirdparty/sentry/sentry";
import { GuildData } from "types";
import Redis from "./database/redis";


export class FreeStuffBot extends Client {

  public commandHandler: CommandHandler;
  public databaseManager: DatabaseManager;
  public messageDistributor: MessageDistributor;
  public adminCommandHandler: AdminCommandHandler;
  public dataFetcher: DataFetcher;
  public sharder: Sharder;
  public languageManager: LanguageManager;
  public localisation: Localisation;
  
  public dbl: any;
  public readonly devMode: boolean;
  public readonly singleShard: boolean;

  constructor(options: ClientOptions, params: any) {
    super(options);

    this.devMode = process.env.NODE_ENV == 'dev';
    this.singleShard = !!params.noSharding;

    if (this.devMode) {
      console.log(chalk.bgRedBright.black(' RUNNING DEV MODE '));
      console.log(chalk.yellowBright('Skipping Sentry initialization ...'));
    } else {
      console.log(chalk.yellowBright('Initializing Sentry ...'));
      SentryManager.init();
      console.log(chalk.green('Sentry initialized'));
    }
    
    logVersionDetails();
    
    Util.init();

    MongoAdapter.connect(config.mongodb.url)
      .catch(err => {
        console.error(err);
      })
      .then(async () => {
        console.log('Connected to Mongo');

        await Database.init();
        await Redis.init();
    
        this.commandHandler = new CommandHandler(this);
        this.databaseManager = new DatabaseManager(this);
        this.messageDistributor = new MessageDistributor(this);
        this.adminCommandHandler = new AdminCommandHandler(this);
        this.dataFetcher = new DataFetcher(this);
        this.sharder = new Sharder(this);
        this.languageManager = new LanguageManager(this);
        this.localisation = new Localisation(this);

        DbStats.startMonitoring(this);

        if (!this.devMode) {
          if (this.singleShard) {
            this.dbl = new DBL(config.thirdparty.topgg.apitoken, this);
          } else {
            this.dbl = new DBL(config.thirdparty.topgg.apitoken);
          }
        }

        this.on('ready', () => {
          console.log(chalk`Bot ready! Logged in as {yellowBright ${this.user.tag}} {gray (${params.noSharding ? 'No Sharding' : `Shard ${options.shardId} / ${options.shardCount}`})}`);
          this.user.setActivity('@FreeStuff help​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​https://freestuffbot.xyz/', { type: 'WATCHING' });
          DbStats.usage.then(u => u.reconnects.updateToday(1, true));

          if (!this.devMode && !this.singleShard) {
            this.dbl.postStats(this.guilds.size, this.options.shardId, this.options.shardCount);
            this.setInterval(() => {
              this.dbl.postStats(this.guilds.size, this.options.shardId, this.options.shardCount);
            }, 1800000);
          }
        });

        this.login(config.bot.token);
      });
  }

  public text(d: GuildData, text: string, replace?: { [varname: string]: string }): string {
    let out = (text.startsWith('=')
      ? this.languageManager.getRaw(d.language, text.substr(1), true)
      : text);
    if (replace) {
      for (const key in replace) {
        out = out.split(`{${key}}`).join(replace[key]);
      }
    }
    return out;
  }

}


const params = ParseArgs.parse(process.argv);

const sharding = !params.noSharding;
if (sharding && (!params.shardCount || !params.shardId)) {
  console.error(chalk.red`Missing --shardCount or --shardId`);
  process.exit(-1);
}
const shardCount = parseInt(params.shardCount as string, 10);
const shardId = parseInt(params.shardId as string, 10);
if (sharding && (!params.shardCount || !params.shardId)) {
  console.error(chalk.red`Invalid --shardCount or --shardId`);
  process.exit(-1);
}

export const Core = new FreeStuffBot(
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
