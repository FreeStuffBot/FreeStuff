/* eslint-disable no-dupe-class-members */
import { Long } from 'bson'
import { Currency, DatabaseGuildData, GuildData, Platform, PriceClass, Theme } from '@freestuffbot/typings'
import { Const, Localisation } from '@freestuffbot/common'
import Database from '../database/database'
import { Util } from '../lib/util'
import Logger from '../lib/logger'
import Manager from '../controller/manager'
import { GuildSetting } from '../types/context'


export default class DatabaseManager {

  private static cacheBucketF: Map<string, GuildData> = new Map() // active bucket if cacheCurrentBucket === False
  private static cacheBucketT: Map<string, GuildData> = new Map() // active bucket if cacheCurrentBucket === True
  private static cacheCurrentBucket: boolean = false

  public static init() {
    DatabaseManager.startGarbageCollector()
  }

  public static async onShardReady(_id: number) {
    // const dbGuilds = await DatabaseManager.getAssignedGuilds(id)

    // if (!Core) return
    // for (const guild of Core.guilds.cache.values()) {
    //   if (guild.shardId !== id) continue
    //   if (dbGuilds.find(g => g._id.toString() === guild.id)) continue

    //   DatabaseManager.addGuild(guild.id)
    // }
  }

  /**
   * Start a scheduled cron task that once a day will remove all data from guilds that no longer have the bot on them from the database
   * ! Do not run DatabaseManager method multiple times without canceling the task first !
   *
   * Also starts the timer to clear and switch guild data cache buckets
   * @param bot bot instance
   */
  private static startGarbageCollector(): void {
    // new CronJob('0 0 0 * * *', async () => {
    //   for (const shard of Manager.getTask()?.ids ?? [ 0 ]) {
    //     const dbGuilds = await DatabaseManager.getAssignedGuilds(shard)
    //     const removalQueue: DatabaseGuildData[] = []
    //     for (const guild of dbGuilds) {
    //       Core?.guilds.fetch(guild._id.toString())
    //         .then(() => {})
    //         .catch(_err => removalQueue.push(guild))
    //     }

    //     setTimeout(async () => {
    //       const dbGuilds = await DatabaseManager.getAssignedGuilds(shard)
    //       for (const guild of dbGuilds) {
    //         Core?.guilds.fetch(guild._id.toString())
    //           .then(() => {})
    //           .catch((_err) => {
    //             if (removalQueue.find(g => g._id.equals(guild._id)))
    //               DatabaseManager.removeGuild(guild._id as any)
    //           })
    //       }
    //     }, 1000 * 60 * 30)
    //   }
    // }).start()

    setInterval(() => {

      // clear the older bucket
      if (DatabaseManager.cacheCurrentBucket)
        DatabaseManager.cacheBucketF = new Map()
      else
        DatabaseManager.cacheBucketT = new Map()

      // do the flip
      DatabaseManager.cacheCurrentBucket = !DatabaseManager.cacheCurrentBucket

      // save changes in the old one
      if (DatabaseManager.cacheCurrentBucket) {
        for (const obj of DatabaseManager.cacheBucketF.values())
          DatabaseManager.saveQueuedChanges(obj)
      } else {
        for (const obj of DatabaseManager.cacheBucketT.values())
          DatabaseManager.saveQueuedChanges(obj)
      }
    }, 10e3)
  }

  private static async saveQueuedChanges(data: GuildData) {
    if (!(data as any)?._changes) return
    await Database
      .collection('guilds')
      .updateOne(
        { _id: data._id },
        { $set: (data as any)._changes }
      )
    delete (data as any)._changes
  }

  /**
   * Returns an array of the guilddata from each of the guilds belonging to the current shard
   */
  public static getAssignedGuilds(shardid: number): Promise<DatabaseGuildData[]> {
    return Database
      .collection('guilds')
      ?.find(
        Manager.getTask()?.total
          ? { sharder: { $mod: [ Manager.getTask().total, shardid ] } }
          : { }
      )
      .toArray()
  }

  /**
   * Add a guild to the database
   * @param guildId guild id as string
   * @param autoSettings whether the default settings should automatically be adjusted to the server (e.g: server region -> language)
   */
  public static async addGuild(guildId: string) {
    const exists = await Database
      .collection('guilds')
      ?.findOne({ _id: Long.fromString(guildId) })
    if (exists) return

    const data: DatabaseGuildData = {
      _id: Long.fromString(guildId) as any,
      sharder: Long.fromString(guildId).shiftRight(22) as any,
      webhook: null,
      channel: null,
      role: null,
      settings: Const.getDefaultSettingsBits(),
      filter: Const.getDefaultFilterBits(),
      tracker: 0
    }
    await Database
      .collection('guilds')
      ?.insertOne(data)
  }

  /**
   * Remove a guild from the database
   * @param guildid guild id
   * @param force weather to force a removal or not. if not forced DatabaseManager method will not remove guilds that are managed by another shard
   */
  public static async removeGuild(guildid: Long, force = false) {
    if (!force && !Util.belongsToShard(guildid)) return
    await Database
      .collection('guilds')
      ?.deleteOne({ _id: guildid })
    DatabaseManager.cacheBucketF.delete(guildid.toString())
    DatabaseManager.cacheBucketT.delete(guildid.toString())
  }

  /**
   * Get the raw / unparsed guilds data from the database
   * @param guild guild object
   */
  public static async getRawGuildData(guild: string, addIfNotExists: boolean): Promise<DatabaseGuildData> {
    const obj = await Database
      .collection('guilds')
      ?.findOne({ _id: Long.fromString(guild) })
      .catch(Logger.error)
    if (!obj) {
      if (addIfNotExists) {
        await this.addGuild(guild)
        return this.getRawGuildData(guild, false)
      } else {
        return undefined
      }
    }
    return obj
  }

  /**
   * Get the guilds data from the database
   * @param guild guild object
   */
  public static async getGuildData(guild: string): Promise<GuildData> {
    if (!guild) return undefined

    if (DatabaseManager.cacheCurrentBucket) {
      let data = DatabaseManager.cacheBucketT.get(guild) // not using .has because buckets might swap in between the .has and the .get call
      if (data) return data
      data = DatabaseManager.cacheBucketF.get(guild)
      DatabaseManager.cacheBucketT.set(guild, data) // take data from older bucket into newer bucket
      if (data) return data
    } else {
      let data = DatabaseManager.cacheBucketF.get(guild)
      if (data) return data
      data = DatabaseManager.cacheBucketT.get(guild)
      DatabaseManager.cacheBucketF.set(guild, data)
      if (data) return data
    }

    const obj = await DatabaseManager.getRawGuildData(guild, true)
    if (!obj) return undefined
    const data = DatabaseManager.parseGuildData(obj, false)

    if (DatabaseManager.cacheCurrentBucket)
      DatabaseManager.cacheBucketT.set(guild, data)
    else
      DatabaseManager.cacheBucketF.set(guild, data)
    return data
  }

  /**
   * Parse a DatabaseGuildData object to a GuildData object
   * @param dbObject raw input
   */
  public static parseGuildData(dbObject: DatabaseGuildData, checkCache = true): GuildData {
    if (!dbObject) return undefined

    if (checkCache) {
      if (DatabaseManager.cacheCurrentBucket && DatabaseManager.cacheBucketT.get(dbObject._id.toString()))
        return DatabaseManager.cacheBucketT.get(dbObject._id.toString())
      else if (!DatabaseManager.cacheCurrentBucket && DatabaseManager.cacheBucketF.get(dbObject._id.toString()))
        return DatabaseManager.cacheBucketF.get(dbObject._id.toString())
    }

    return {
      ...dbObject,
      currency: Const.currencies[(dbObject.settings >> 5 & 0b1111)] || Const.currencies[0],
      price: Const.priceClasses[(dbObject.filter >> 2 & 0b11)] || Const.priceClasses[2],
      react: (dbObject.settings & (1 << 9)) !== 0,
      trashGames: (dbObject.filter & (1 << 0)) !== 0,
      theme: Const.themes[dbObject.settings & 0b11111] || Const.themes[0],
      language: Localisation.languageById((dbObject.settings >> 10 & 0b111111)),
      platformsRaw: (dbObject.filter >> 4 & 0b11111111),
      platformsList: DatabaseManager.platformsRawToList(dbObject.filter >> 4 & 0b11111111),
      beta: (dbObject.settings & (1 << 30)) !== 0
    }
  }

  public static platformsRawToList(raw: number): Platform[] {
    const out = [] as Platform[]
    for (const platform of Const.platforms) {
      if ((raw & platform.bit) !== 0)
        out.push(platform)
    }

    return out
  }

  /**
   * Change a guild's setting
   * @param data current guild data object
   * @param setting the setting to change
   * @param value it's new value
   */
  public static changeSetting(data: GuildData, setting: 'channel' | 'role' | 'webhook', value: string | null)
  public static changeSetting(data: GuildData, setting: 'react' | 'trash' | 'beta', value: boolean)
  public static changeSetting(data: GuildData, setting: 'language' | 'tracker', value: number)
  public static changeSetting(data: GuildData, setting: 'price', value: PriceClass)
  public static changeSetting(data: GuildData, setting: 'theme', value: number | Theme)
  public static changeSetting(data: GuildData, setting: 'currency', value: number | Currency)
  public static changeSetting(data: GuildData, setting: 'platforms', value: Platform[] | number)
  public static changeSetting(data: GuildData, setting: GuildSetting, value: any) {
    const out = {} as any
    let bits = 0

    switch (setting) {
      case 'channel':
        out.channel = value ? Long.fromString(value as string) : null
        data.channel = out.channel
        break
      case 'role':
        out.role = value ? Long.fromString(value as string) : null
        data.role = out.role
        break
      case 'price':
        bits = (value as PriceClass).id
        data.filter = Util.modifyBits(data.filter, 2, 2, bits)
        out.filter = data.filter
        data.price = value as PriceClass
        break
      case 'theme':
        if (typeof value !== 'number')
          value = (value as Theme).id
        bits = (value as number) & 0b11111
        data.settings = Util.modifyBits(data.settings, 0, 5, bits)
        out.settings = data.settings
        data.theme = Const.themes[value]
        break
      case 'currency':
        if (typeof value !== 'number')
          value = (value as Currency).id
        bits = (value as number) & 0b1111
        data.settings = Util.modifyBits(data.settings, 5, 4, bits)
        out.settings = data.settings
        data.currency = Const.currencies[value]
        break
      case 'react':
        bits = value ? 1 : 0
        data.settings = Util.modifyBits(data.settings, 9, 1, bits)
        out.settings = data.settings
        data.react = !!value
        break
      case 'trash':
        bits = value ? 1 : 0
        data.filter = Util.modifyBits(data.filter, 0, 1, bits)
        out.filter = data.filter
        data.trashGames = !!value
        break
      case 'language':
        bits = (value as number) & 0b111111
        data.settings = Util.modifyBits(data.settings, 10, 6, bits)
        out.settings = data.settings
        data.language = Localisation.languageById(value)
        break
      case 'platforms':
        if (typeof value === 'number') {
          bits = value & 0b11111111
        } else {
          for (const platform of (value as Platform[]))
            bits ^= platform.bit
        }
        data.filter = Util.modifyBits(data.filter, 4, 8, bits)
        out.filter = data.filter
        data.platformsRaw = bits
        data.platformsList = DatabaseManager.platformsRawToList(bits)
        break
      case 'beta':
        bits = value ? 1 : 0
        data.settings = Util.modifyBits(data.settings, 30, 1, bits)
        out.settings = data.settings
        data.beta = !!value
        break
      case 'tracker':
        out.tracker = value
        data.tracker = value
        break
      case 'webhook':
        out.webhook = value
        data.webhook = value
        break
    }

    // await Database
    //   .collection('guilds')
    //   ?.updateOne({ _id: data._id }, { $set: out })
    (data as any)._changes = {
      ...((data as any)._changes || {}),
      ...out
    }
  }

  // settings: (do not use bit 31, causes unwanted effects with negative number conversion)
  // 3__ 2__________________ 1__________________ 0__________________
  // 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0
  //   _                           _____________ _ _______ _________
  // 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
  //   |                           |             | |       |
  //   |                           |             | |       theme [0< 5]
  //   |                           |             | currency [5< 4]
  //   |                           |             react with :free: emoji [9< 1]
  //   |                           language [10< 7]
  //   opted in to beta tests [30< 1]

  // filter: (do not use bit 31, causes unwanted effects with negative number conversion)
  // 3__ 2__________________ 1__________________ 0__________________
  // 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0
  //                                         _______________ ___ _ _
  // 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
  //                                         |               |   | |
  //                                         |               |   | show trash games [0< 1]
  //                                         |               |   reserved [1< 1]
  //                                         |               minimum price [2< 2]
  //                                         platforms [4< 8]

}
