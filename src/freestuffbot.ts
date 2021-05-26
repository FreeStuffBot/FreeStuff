import { Client } from 'discord.js'
import * as chalk from 'chalk'
import { FreeStuffApi } from 'freestuff'
import CommandHandler from './bot/command-handler'
import DatabaseManager from './bot/database-manager'
import MessageDistributor from './bot/message-distributor'
import AdminCommandHandler from './bot/admin-command-handler'
import AnnouncementManager from './bot/announcement-manager'
import LanguageManager from './bot/language-manager'
import Localisation from './bot/localisation'
import { DbStats } from './database/db-stats'
import { GitCommit } from './lib/git-parser'
import Const from './bot/const'
import InteractionHandler from './bot/interactions-handler'
import { GuildData } from './types/datastructs'
import Logger from './lib/logger'
import Manager from './controller/manager'
import WebhookServer from './controller/webhookserver'
import RemoteConfig from './controller/remote-config'
import { config } from './index'


export default class FreeStuffBot extends Client {

  public fsapi: FreeStuffApi;

  public commandHandler: CommandHandler;
  public databaseManager: DatabaseManager;
  public messageDistributor: MessageDistributor;
  public adminCommandHandler: AdminCommandHandler;
  public announcementManager: AnnouncementManager;
  public languageManager: LanguageManager;
  public localisation: Localisation;
  public interactionsHandler: InteractionHandler;

  //

  public start(gitCommit: GitCommit) {
    if (this.readyAt) return // bot is already started
    Manager.status('startup')

    this.fsapi = new FreeStuffApi({
      ...config.apisettings as any,
      version: gitCommit.shortHash,
      sid: this.options.shards[0]
    })

    if (config.apisettings.server?.enable)
      WebhookServer.start(config.apisettings.server)

    this.commandHandler = new CommandHandler(this)
    this.databaseManager = new DatabaseManager(this)
    this.messageDistributor = new MessageDistributor()
    this.adminCommandHandler = new AdminCommandHandler(this)
    this.announcementManager = new AnnouncementManager(this)
    this.languageManager = new LanguageManager()
    this.localisation = new Localisation()
    this.interactionsHandler = new InteractionHandler(this)

    DbStats.startMonitoring(this)

    // TODO find an actual fix for this instead of this garbage lol
    const manualConnectTimer = setTimeout(() => {
      // @ts-ignore
      this.ws?.connection?.triggerReady()
    }, 30000)

    this.on('ready', () => {
      clearTimeout(manualConnectTimer)
      Manager.status('operational')

      const shard = `Shard ${(this.options.shards as number[]).join(', ')} / ${this.options.shardCount}`
      Logger.process(chalk`Bot ready! Logged in as {yellowBright ${this.user?.tag}} {gray (${shard})}`)
      if (config.bot.mode !== 'regular') Logger.process([ 'Guilds:', ...this.guilds.cache.map(g => `  ${g.name} :: ${g.id}`) ].join('\n'))

      this.startBotActvity()
      DbStats.usage.then(u => u.reconnects.updateToday(1, true))

      this.fsapi.ping().then((res) => {
        if (res._status !== 200)
          Logger.warn(`API Ping failed with code ${res._status}: ${res.error}, ${res.message}`)
      })
    })

    this.on('shardDisconnect', () => { Manager.status('disconnected') })
    this.on('shardReconnecting', () => { Manager.status('reconnecting') })
    this.on('shardResume', () => { Manager.status('operational') })
    this.on('shardReady', () => { Manager.status('operational') })

    Manager.status('identifying')
    this.login(config.bot.token)
  }

  private startBotActvity() {
    const updateActivity = (u) => {
      u?.setActivity(
        `@${u.username} help`
          .padEnd(54, '~')
          .split('~~').join(' ​')
          .replace('~', '') + Const.links.website,
        { type: 'WATCHING' }
      )

      if (RemoteConfig.excessiveLogging)
        Logger.log('Updating bot activity')
    }
    setInterval(updateActivity, 1000 * 60 * 15, this.user)
    updateActivity(this.user)
  }

  //

  public text(d: GuildData, text: string, replace?: { [varname: string]: string }): string {
    let out = (text.startsWith('=')
      ? this.languageManager.getRaw(d.language, text.substr(1), true)
      : text)
    if (replace) {
      for (const key in replace)
        out = out.split(`{${key}}`).join(replace[key])
    }
    return out
  }

}
