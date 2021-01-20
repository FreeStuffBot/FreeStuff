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
import AnnouncementManager from "./bot/announcement-manager";
import Sharder from "./bot/sharder";
import LanguageManager from "./bot/language-manager";
import Localisation from "./bot/localisation";
import { DbStats } from "./database/db-stats";
import { getGitCommit, logVersionDetails } from "./util/git-parser";
import * as chalk from "chalk";
import * as DBL from "dblapi.js";
import ParseArgs from "./util/parse-args";
import SentryManager from "./thirdparty/sentry/sentry";
import { GuildData } from "types";
import Redis from "./database/redis";
import Const from "./bot/const";
import { FreeStuffApi } from "freestuff";


export class FreeStuffBot extends Client {

  public fsapi: FreeStuffApi;

  public commandHandler: CommandHandler;
  public databaseManager: DatabaseManager;
  public messageDistributor: MessageDistributor;
  public adminCommandHandler: AdminCommandHandler;
  public announcementManager: AnnouncementManager;
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

        const apisettings = { ...config.apisettings, version: (await getGitCommit()).shortHash };
        apisettings.sid = this.singleShard ? '0' : this.options.shards[0];
        this.fsapi = new FreeStuffApi(apisettings);
    
        this.commandHandler = new CommandHandler(this);
        this.databaseManager = new DatabaseManager(this);
        this.messageDistributor = new MessageDistributor(this);
        this.adminCommandHandler = new AdminCommandHandler(this);
        this.announcementManager = new AnnouncementManager(this);
        this.sharder = new Sharder(this);
        this.languageManager = new LanguageManager(this);
        this.localisation = new Localisation(this);

        DbStats.startMonitoring(this);

        if (!this.devMode) {
          this.dbl = new DBL(config.thirdparty.topgg.apitoken);
        }

        // TODO find an actual fix for this instead of this garbage lol
        const manualConnectTimer = setTimeout(() => {
          // @ts-ignore
          this.ws?.connection?.triggerReady();
        }, 30000);

        this.on('ready', () => {
          console.log(chalk`Bot ready! Logged in as {yellowBright ${this.user?.tag}} {gray (${params.noSharding ? 'No Sharding' : `Shard ${(options.shards as number[]).join(', ')} / ${options.shardCount}`})}`);
          if (this.devMode) console.log(this.guilds.cache.map(g => `${g.name} :: ${g.id}`));

          const updateActivity = (u) => u?.setActivity(`@${u.username} help`.padEnd(54, '~').split('~~').join(' ​').replace('~', '') + Const.links.website, { type: 'WATCHING' });
          setInterval(updateActivity, 1000 * 60 * 15, this.user);
          updateActivity(this.user);

          clearTimeout(manualConnectTimer);
          DbStats.usage.then(u => u.reconnects.updateToday(1, true));

          if (!this.devMode) {
            const updateStats = (c) => c.dbl.postStats(c.guilds.cache.size, c.options.shards[0], c.options.shardCount);
            this.setInterval(updateStats, 1000 * 60 * 30, this);
            updateStats(this);
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
      for (const key in replace)
        out = out.split(`{${key}}`).join(replace[key]);
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
    ws: {
      intents: [
        'GUILDS',
        'GUILD_MESSAGES',
      ]
    },
    disableMentions: 'none',
    messageSweepInterval: 2,
    messageCacheLifetime: 2,
    messageCacheMaxSize: 2,
    shardCount: sharding ? shardCount : 1,
    shards: [ (sharding ? shardId : 0) ]
  },
  params
);
