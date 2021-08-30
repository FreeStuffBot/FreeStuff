import { Guild, MessageOptions } from 'discord.js'
import { Long } from 'mongodb'
import { GameFlag, GameInfo } from 'freestuff'
import { Core, FSAPI } from '../index'
import Database from '../database/database'
import { DbStats } from '../database/db-stats'
import SentryManager from '../thirdparty/sentry/sentry'
import Redis from '../database/redis'
import { DatabaseGuildData, GuildData } from '../types/datastructs'
import RemoteConfig from '../controller/remote-config'
import Logger from '../lib/logger'
import DatabaseManager from './database-manager'
import Const from './const'


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
  public static test(guild: Guild, content: GameInfo): void {
    Database
      .collection('guilds')
      .findOne({ _id: Long.fromString(guild.id) })
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
    const data = await DatabaseManager.parseGuildData(g)

    if (!data) {
      Logger.excessive(`Guild ${g._id} return: no data`)
      return []
    }

    // forced will ignore filter settings
    if (!force) {
      content = content
        .filter(game => data.price.from <= game.org_price.euro /* TODO */)
        .filter(game => data.trashGames || !(game.flags & GameFlag.TRASH))
        .filter(game => data.platformsList.includes(Const.platforms.find(p => p.id === game.store) || Const.platforms[0]))

      if (!content.length) {
        Logger.excessive(`Guild ${g._id} return: no content left`)
        return []
      }
    }

    // check if channel is valid
    if (!data.channelInstance) {
      Logger.excessive(`Guild ${g._id} return: invalid channel`)
      return []
    }
    if (!data.channelInstance.send) {
      Logger.excessive(`Guild ${g._id} return: no send func`)
      return []
    }
    if (!data.channelInstance.guild.available) {
      Logger.excessive(`Guild ${g._id} return: guild unavailable`)
      return []
    }

    // check if permissions match
    const self = data.channelInstance.guild.me
    const permissions = self.permissionsIn(data.channelInstance)
    if (!permissions.has('SEND_MESSAGES')) {
      Logger.excessive(`Guild ${g._id} return: no SEND_MESSAGES`)
      return []
    }
    if (!permissions.has('VIEW_CHANNEL')) {
      Logger.excessive(`Guild ${g._id} return: no VIEW_CHANNEL`)
      return []
    }
    if (!permissions.has('EMBED_LINKS') && data.theme.usesEmbeds) {
      Logger.excessive(`Guild ${g._id} return: no EMBED_LINKS`)
      return []
    }

    // build message objects
    const messagePayload = MessageDistributor.buildMessage(content, data, test)

    // send the messages
    const message = await data.channelInstance.send(messagePayload)
    if (message && data.react && permissions.has('ADD_REACTIONS') && permissions.has('READ_MESSAGE_HISTORY'))
      await message.react('🆓')

    // if (!test && (data.channelInstance as Channel).type === 'news')
    //   messages.forEach(m => m.crosspost())
    // TODO check if ratelimited
    // TODO check if it has the "manage messages" permission. although not required to publish own messages, there needs to be a way to turn MessageDistributor off

    Logger.excessive(`Guild ${g._id} noret: success`)
    return content.map(game => game.id)
  }

  /**
   * Finds the used theme and lets that theme build the message
   * @returns Tupel with message.content and message.options?
   */
  public static buildMessage(content: GameInfo[], data: GuildData, test: boolean): MessageOptions {
    const theme = data.theme.builder
    return theme.build(content, data, { test })
  }

}
