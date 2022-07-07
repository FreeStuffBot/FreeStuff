import { TextChannel, Webhook } from 'discord.js'
import { Long } from 'mongodb'
import axios from 'axios'
import { DatabaseGuildData, GameFlag, GameInfo, GuildData } from '@freestuffbot/typings'
import { Const, Localisation, Themes } from '@freestuffbot/common'
import { InteractionApplicationCommandCallbackData } from 'cordo'
import { config, Core, FSAPI } from '../index'
import Database from '../database/database'
import { DbStats } from '../database/db-stats'
import SentryManager from '../thirdparty/sentry/sentry'
import Redis from '../database/redis'
import RemoteConfig from '../controller/remote-config'
import Logger from '../lib/logger'
import Experiments from '../controller/experiments'
import Metrics from '../lib/metrics'
import DatabaseManager from './database-manager'


type WebhookSendStatus
  = 'success' // all good, everything worked
  | 'invalid' // invalid webhook, create new one
  | 'retry' // something failed, try again

export default class MessageDistributor {

  /**
   * Sends out the games to all guilds MessageDistributor shard is responsible for
   * @param content game(s) to announce
   */
  public static async distribute(content: GameInfo[]): Promise<void> {
    content = content.filter(g => g.type === 'free') // TODO

    const lga = await Redis.getSharded('lga')
    const startAt = lga ? parseInt(lga, 10) : 0

    const query = Core.options.shardCount === 1
      ? {
          sharder: { $gt: startAt },
          channel: { $ne: null }
        }
      : {
          $and: [
            { $or: (Core.options.shards as number[]).map(shard => ({ sharder: { $mod: [ Core.options.shardCount, shard ] } })) },
            { sharder: { $gt: startAt }, channel: { $ne: null } }
          ]
        }

    const guilds: DatabaseGuildData[] = await Database
      .collection('guilds')
      .find(query)
      .sort({ sharder: 1 })
      .toArray()
    if (!guilds) return

    Logger.info(`Starting to announce ${content.length} games on ${guilds.length} guilds: ${content.map(g => g.title)} - ${new Date().toLocaleTimeString()}`)
    await Redis.setSharded('am', '0')
    for (const g of guilds) {
      if (!g) {
        Logger.excessive('Skipping one guild for being falsy')
        continue
      }

      try {
        Redis.setSharded('lga', g.sharder + '')
        Logger.excessive(`Sending to ${g._id}`)
        const successIn = await MessageDistributor.sendToGuild(g, content, false, false)
        Logger.excessive(`Success in ${g._id}: ${successIn}`)
        if (successIn.length) {
          for (const id of successIn)
            Redis.incSharded('am_' + id)
          await new Promise(res => setTimeout(() => res(null), RemoteConfig.announcementMessageDelay * successIn.length))
        }
      } catch (ex) {
        Logger.error(ex)
        SentryManager.report(ex)
      }
    }

    Logger.info(`Done announcing: ${content.map(g => g.title)} - ${new Date().toLocaleTimeString()}`)
    const announcementsMade = await Promise.all(content.map(async (game) => {
      return { id: game.id, reach: parseInt(await Redis.getSharded('am_' + game.id), 10) }
    }))
    const announcementsMadeTotal = announcementsMade.map(e => e.reach).reduce((p, c) => (p + c), 0)

    content.forEach(c => Redis.setSharded('am_' + c.id, '0')) // AMount (of announcements done)
    await Redis.setSharded('lga', '') // Last Guild Announced (guild id)

    ;(await DbStats.usage).announcements.updateToday(announcementsMadeTotal, true)

    announcementsMade.forEach(game => FSAPI.postGameAnalytics(game.id, 'discord', { reach: game.reach }))
  }

  /**
   * Run a test announcement on guild with content
   * @param guild guild to run the test on
   * @param content content of the test message
   */
  public static test(guildId: string, content: GameInfo): void {
    Database
      .collection('guilds')
      .findOne({ _id: Long.fromString(guildId) })
      .then((g: DatabaseGuildData) => {
        if (!g) return
        MessageDistributor.sendToGuild(g, [ content ], true, true)
      })
      .catch(Logger.error)
  }

  /**
   * Sends announcement message(s) to a guild
   * @param g Guild to announce to
   * @param content Games to announce
   * @param test Whether MessageDistributor was a test message (/test command)
   * @param force Whether or not to ignore guild filter settings
   * @returns Array of guild ids that were actually announced (and not filtered out by guild settings)
   */
  public static async sendToGuild(g: DatabaseGuildData, content: GameInfo[], test: boolean, force: boolean): Promise<number[]> {
    const data = DatabaseManager.parseGuildData(g)

    if (!data) {
      Logger.excessive(`Guild ${g._id} return: no data`)
      Metrics.counterOutgoing.labels({ status: 'no_data' }).inc()
      return []
    }

    // forced will ignore filter settings
    if (!force) {
      content = content
        .filter(game => data.price.from <= (game.org_price[data.currency.code] || game.org_price.euro))
        .filter(game => data.trashGames || !(game.flags & GameFlag.TRASH))
        .filter(game => data.platformsList.includes(Const.platforms.find(p => p.id === game.store) || Const.platforms[0]))

      if (!content.length) {
        Logger.excessive(`Guild ${g._id} return: no content left`)
        Metrics.counterOutgoing.labels({ status: 'no_content' }).inc()
        return []
      }
    }

    const channel = await MessageDistributor.getChannel(data.channel.toString())

    // check if channel is valid
    if (!channel) {
      Logger.excessive(`Guild ${g._id} return: invalid channel`)
      Metrics.counterOutgoing.labels({ status: 'channel_invalid' }).inc()
      return []
    }
    if (!channel.send) {
      Logger.excessive(`Guild ${g._id} return: no send func`)
      Metrics.counterOutgoing.labels({ status: 'no_send_func' }).inc()
      return []
    }
    if (!channel.guild.available) {
      Logger.excessive(`Guild ${g._id} return: guild unavailable`)
      Metrics.counterOutgoing.labels({ status: 'guild_unavailable' }).inc()
      return []
    }

    // check if permissions match
    const self = await channel.guild.members.fetch(Core.user.id)
    const permissions = self.permissionsIn(channel)
    if (!permissions.has('SEND_MESSAGES')) {
      Logger.excessive(`Guild ${g._id} return: no SEND_MESSAGES`)
      Metrics.counterOutgoing.labels({ status: 'noper_send' }).inc()
      return []
    }
    if (!permissions.has('VIEW_CHANNEL')) {
      Logger.excessive(`Guild ${g._id} return: no VIEW_CHANNEL`)
      Metrics.counterOutgoing.labels({ status: 'noper_view' }).inc()
      return []
    }
    if (!permissions.has('EMBED_LINKS') && data.theme.usesEmbeds) {
      Logger.excessive(`Guild ${g._id} return: no EMBED_LINKS`)
      Metrics.counterOutgoing.labels({ status: 'noper_embed' }).inc()
      return []
    }

    // only once per month - maybe redis entry to save last month and if unequal to current month, do this?
    const donationNotice = !test && Experiments.runExperimentOnServer('show_donation_notice', data)

    // build message objects
    // TODO BIG TODO, types dont match with messagePayload - SCHEINT EGAL ZU SEIN LETSGOOOOOOOooooooooo........
    const messagePayload = MessageDistributor.buildMessage(content, data, test, donationNotice)
    if (!messagePayload.content) delete messagePayload.content

    const useWebhooks = Experiments.runExperimentOnServer('webhook_migration', data)
    if (useWebhooks) {
      let createNew = false

      if (data.webhook) {
        let res = await this.sendWebhook(data, messagePayload)

        if (res === 'retry')
          res = await this.sendWebhook(data, messagePayload)
        if (res === 'invalid')
          createNew = true
      } else {
        createNew = true
      }

      if (createNew) {
        const hook = await this.createWebhook(data, channel, true)
        if (hook) {
          DatabaseManager.changeSetting(data, 'webhook', `${hook.id}/${hook.token}`)
          await hook.send({ ...messagePayload as any, username: Localisation.getLine(data, 'announcement_header') })
        } else if (test) {
          // if it is a test message, tell them to give more permissions!

          channel.send({
            embeds: [ {
              title: Localisation.getLine(data, hook === false ? 'webhook_migration_failed_too_many_hooks_1' : 'webhook_migration_failed_missing_permissions_1'),
              description: Localisation.getLine(data, hook === false ? 'webhook_migration_failed_too_many_hooks_2' : 'webhook_migration_failed_missing_permissions_2'),
              color: Const.embedDefaultColor
            } ]
          })
        } else {
          // if it's not a test message, announce the game the old way

          if (messagePayload.embeds) {
            messagePayload.embeds.push({
              color: Const.embedDefaultColor,
              description: '⚠️ ' + Localisation.getLine(data, 'webhook_migration_notice')
            })
          } else {
            messagePayload.content += '\n\n⚠️ ' + Localisation.getLine(data, 'webhook_migration_notice')
          }

          const message = await channel.send(messagePayload as any)
          if (message && data.react && permissions.has('ADD_REACTIONS') && permissions.has('READ_MESSAGE_HISTORY'))
            await message.react('🆓')
        }
      }
    } else {
      const message = await channel.send(messagePayload as any)
      if (message && data.react && permissions.has('ADD_REACTIONS') && permissions.has('READ_MESSAGE_HISTORY'))
        await message.react('🆓')
    }

    // if (!test && (data.channelInstance as Channel).type === 'news')
    //   messages.forEach(m => m.crosspost())
    // TODO check if ratelimited
    // TODO check if it has the "manage messages" permission. although not required to publish own messages, there needs to be a way to turn MessageDistributor off

    Logger.excessive(`Guild ${g._id} noret: success`)
    Metrics.counterOutgoing.labels({ status: 'success' }).inc()
    return content.map(game => game.id)
  }

  /**
   * Finds the used theme and lets that theme build the message
   * @returns Tupel with message.content and message.options?
   */
  public static buildMessage(content: GameInfo[], data: GuildData, test: boolean, donationNotice: boolean): InteractionApplicationCommandCallbackData {
    return Themes.build(content, data, { test, donationNotice }) as InteractionApplicationCommandCallbackData
  }

  // #####################

  public static async sendWebhook(data: GuildData, payload: InteractionApplicationCommandCallbackData): Promise<WebhookSendStatus> {
    try {
      const { status } = await axios.post(
        `https://discordapp.com/api/webhooks/${data.webhook}`,
        {
          ...payload,
          username: Localisation.text(data, '=announcement_header'),
          avatar_url: Const.brandIcons.regularRound
        },
        {
          validateStatus: null
        }
      )

      if (status >= 200 && status < 300)
        return 'success'

      // TODO add reaction

      if (status === 404)
        return 'invalid'

      Logger.warn(`Webhook send failed with status ${status}`)

      return 'retry'
    } catch (ex) {
      Logger.error(ex)
      return 'retry'
    }
  }

  private static getChannel(id: string): Promise<TextChannel | null> {
    try {
      return Core.channels.fetch(id) as Promise<TextChannel>
    } catch (ex) {
      return null
    }
  }

  /**
   * Move elsewhere
   */
  public static async createWebhook(data: GuildData, channel: TextChannel, tryFetchExisting = true): Promise<Webhook | null | false> {
    if (tryFetchExisting) {
      const hook = await MessageDistributor.findWebhook(channel)
      if (hook) return hook
    }

    const member = channel.guild.members.resolve(Core.user.id)
    if (!channel.permissionsFor(member).has('MANAGE_WEBHOOKS'))
      return null

    try {
      const hook = await channel.createWebhook('FreeStuff', {
        avatar: Const.brandIcons.regularRound,
        reason: Localisation.getLine(data, 'webhook_create_auditlog_reason')
      })

      return hook ?? null
    } catch (ex) {
      Logger.error(ex)
      if (ex.code === 30007)
        return false
      return null
    }
  }

  /**
   * Move elsewhere
   */
  public static async findWebhook(channel: TextChannel): Promise<Webhook | null> {
    try {
      const hooks = await channel.fetchWebhooks()
      const hook = hooks.find(h => h.owner?.id === config.bot.clientId)
      return hook ?? null
    } catch (ex) {
      Logger.error(ex)
      return null
    }
  }

}
