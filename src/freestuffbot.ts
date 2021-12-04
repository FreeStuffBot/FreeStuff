import Cordo from 'cordo'
import { Client } from 'discord.js'
import * as chalk from 'chalk'
import DatabaseManager from './bot/database-manager'
import AnnouncementManager from './bot/announcement-manager'
import { DbStats } from './database/db-stats'
import Logger from './lib/logger'
import Manager from './controller/manager'
import RemoteConfig from './controller/remote-config'
import Metrics from './lib/metrics'
import { config, FSAPI } from './index'


export default class FreeStuffBot extends Client {

  public announcementManager: AnnouncementManager

  //

  private static readonly interactionTypes = [ '', 'PING', 'APPLICATION_COMMAND', 'MESSAGE_COMPONENT' ]

  public static readonly webhookMigrationImages = {
    default: 'https://media.discordapp.net/attachments/672907465670787083/916666894533144606/webhook_migration_warning_en.png',
    'es-ES': 'https://media.discordapp.net/attachments/672907465670787083/916666894755450880/webhook_migration_warning_es.png',
    'pt-BR': 'https://media.discordapp.net/attachments/672907465670787083/916666894336004106/webhook_migration_warning_pt.png',
    'de-DE': 'https://media.discordapp.net/attachments/672907465670787083/916666894138900491/webhook_migration_warning_de.png'
  }

  //

  public start() {
    if (this.readyAt) return // bot is already started
    Manager.status(null, 'startup')

    this.announcementManager = new AnnouncementManager(this)

    DbStats.startMonitoring(this)

    // TODO find an actual fix for this instead of this garbage lol
    const manualConnectTimer = setTimeout(() => (this.ws as any)?.connection?.triggerReady(), 30000)
    this.on('ready', () => clearTimeout(manualConnectTimer))

    AnnouncementManager.updateCurrentFreebies()
    setInterval(() => AnnouncementManager.updateCurrentFreebies(), 60 * 60 * 1000) // 1h

    this.registerEventHandlers()

    Manager.status(null, 'identifying')
    this.login(config.bot.token)
  }

  private registerEventHandlers() {
    Logger.excessive('FreeStuffBot#registerEventHandlers')
    // keep { } here or else this. behaves differently
    this.on('shardReady', (id) => { this.onShardReady(id) })
    this.on('shardDisconnect', (_, id) => { Manager.status(id, 'disconnected') })
    this.on('shardReconnecting', (id) => { Manager.status(id, 'reconnecting') })
    this.on('shardResume', (id) => { Manager.status(id, 'operational') })
    this.on('shardReady', (id) => { Manager.status(id, 'operational') })

    this.on('ready', () => {
      this.startBotActvity()
      FSAPI.ping().then((res) => {
        if (res._status !== 200)
          Logger.warn(`API Ping failed with code ${res._status}: ${res.error}, ${res.message}`)
      })
    })

    this.on('raw', (ev: any) => {
      Metrics.counterGatewayEvents.labels({ type: ev.t }).inc()

      // interactions
      if (ev.t === 'INTERACTION_CREATE') {
        Cordo.emitInteraction(ev.d)

        Metrics.counterInteractions.labels({
          type: FreeStuffBot.interactionTypes[ev.d.type as number],
          name: ev.d.data.custom_id || ev.d.data.name
        }).inc()
      }
    })

    // database sync
    this.on('guildCreate', (guild) => {
      DatabaseManager.addGuild(guild.id)
    })
  }

  private onShardReady(id: number) {
    DatabaseManager.onShardReady(id)

    const shard = `Shard ${id} of [${this.options.shards}] / ${this.options.shardCount}`
    Logger.process(chalk`Shard ${id} ready! Logged in as {yellowBright ${this.user?.tag}} {gray (${shard})}`)
    if (config.bot.mode === 'dev') Logger.process([ 'Shard ' + id + ' Guilds:', ...this.guilds.cache.map(g => `  ${g.name} :: ${g.id}`) ].join('\n'))

    DbStats.usage.then(u => u.reconnects.updateToday(1, true))
  }

  private startBotActvity() {
    setInterval(
      u => u?.setActivity(RemoteConfig.botPlaytext, { type: 'WATCHING' }),
      1000 * 60 * 5,
      this.user
    )
    this.user?.setActivity(RemoteConfig.botPlaytext, { type: 'WATCHING' })
  }

}
