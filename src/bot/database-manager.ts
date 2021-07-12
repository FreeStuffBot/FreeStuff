/* eslint-disable no-dupe-class-members */
import { Guild, Role, TextChannel } from 'discord.js'
import { Long } from 'mongodb'
import { CronJob } from 'cron'
import { Core } from '../index'
import FreeStuffBot from '../freestuffbot'
import Database from '../database/database'
import { DatabaseGuildData, GuildData } from '../types/datastructs'
import { Currency, GuildSetting, Platform, PriceClass, Theme } from '../types/context'
import { Util } from '../lib/util'
import Logger from '../lib/logger'
import Localisation from './localisation'
import LanguageManager from './language-manager'
import Const from './const'


export default class DatabaseManager {

  private static cacheBucketF: Map<string, GuildData> = new Map()
  private static cacheBucketT: Map<string, GuildData> = new Map()
  private static cacheCurrentBucket: boolean = false

  public constructor(bot: FreeStuffBot) {
    bot.on('ready', async () => {
      // Check if any guild is not in the database yet
      // Might happen when someone adds the bot while it's offline

      const dbGuilds = await this.getAssignedGuilds()

      for (const guild of bot.guilds.cache.values()) {
        if (!dbGuilds.find(g => g._id.toString() === guild.id))
          this.addGuild(guild)
      }
    })

    bot.on('guildCreate', async (guild) => {
      if (await Database
        .collection('guilds')
        ?.findOne({
          _id: Long.fromString(guild.id)
        })) return

      this.addGuild(guild)
    })

    this.startGarbageCollector(bot)
  }

  /**
   * Start a scheduled cron task that once a day will remove all data from guilds that no longer have the bot on them from the database
   * ! Do not run this method multiple times without canceling the task first !
   *
   * Also starts the timer to clear and switch guild data cache buckets
   * @param bot bot instance
   */
  private startGarbageCollector(bot: FreeStuffBot): void {
    new CronJob('0 0 0 * * *', async () => {
      const dbGuilds = await this.getAssignedGuilds()
      const removalQueue: DatabaseGuildData[] = []
      for (const guild of dbGuilds) {
        bot.guilds.fetch(guild._id.toString())
          .then(() => {})
          .catch(_err => removalQueue.push(guild))
      }

      setTimeout(async () => {
        const dbGuilds = await this.getAssignedGuilds()
        for (const guild of dbGuilds) {
          bot.guilds.fetch(guild._id.toString())
            .then(() => {})
            .catch((_err) => {
              if (removalQueue.find(g => g._id.equals(guild._id)))
                this.removeGuild(guild._id)
            })
        }
      }, 1000 * 60 * 30)
    }).start()

    setTimeout(() => {
      // only flip if the active bucket holds over 20 items
      if (DatabaseManager.cacheCurrentBucket
        && DatabaseManager.cacheBucketT.size < 20) return
      else if (DatabaseManager.cacheBucketF.size < 20) return

      // now do the flip
      DatabaseManager.cacheCurrentBucket = !DatabaseManager.cacheCurrentBucket

      // clear the new bucket
      if (DatabaseManager.cacheCurrentBucket)
        DatabaseManager.cacheBucketT = new Map()
      else
        DatabaseManager.cacheBucketF = new Map()
    }, 10e3)
  }

  /**
   * Returns an array of the guilddata from each of the guilds belonging to the current shard
   */
  public getAssignedGuilds(): Promise<DatabaseGuildData[]> {
    return Database
      .collection('guilds')
      ?.find(
        Core.options.shardCount === 1
          ? { }
          : { sharder: { $mod: [ Core.options.shardCount, Core.options.shards[0] ] } }
      )
      .toArray()
  }

  /**
   * Add a guild to the database
   * @param guild guild object
   * @param autoSettings whether the default settings should automatically be adjusted to the server (e.g: server region -> language)
   */
  public addGuild(guild: Guild) {
    const settings = Localisation.getDefaultSettings(guild)
    const filter = Localisation.getDefaultFilter(guild)

    const data: DatabaseGuildData = {
      _id: Long.fromString(guild.id),
      sharder: Long.fromString(guild.id).shiftRight(22),
      channel: null,
      role: null,
      settings,
      filter
    }
    Database
      .collection('guilds')
      ?.insertOne(data)
  }

  /**
   * Remove a guild from the database
   * @param guildid guild id
   * @param force weather to force a removal or not. if not forced this method will not remove guilds that are managed by another shard
   */
  public async removeGuild(guildid: Long, force = false) {
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
  public async getRawGuildData(guild: string): Promise<DatabaseGuildData> {
    const obj = await Database
      .collection('guilds')
      ?.findOne({ _id: Long.fromString(guild) })
      .catch(Logger.error)
    if (!obj) return undefined
    return obj
  }

  // TODO BIG FAT TODO TO ADD SOME CACHING HERE
  /**
   * Get the guilds data from the database
   * @param guild guild object
   */
  public async getGuildData(guild: string, fetchInstances = true): Promise<GuildData> {
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

    const obj = await this.getRawGuildData(guild)
    if (!obj) return undefined
    const data = await this.parseGuildData(obj, fetchInstances)

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
  public async parseGuildData(dbObject: DatabaseGuildData, fetchInstances = true): Promise<GuildData> {
    if (!dbObject) return undefined
    const responsible = (Core.options.shardCount === 1) || Util.belongsToShard(dbObject._id)
    let guildInstance: Guild = null
    try {
      if (fetchInstances)
        guildInstance = await Core.guilds.fetch(dbObject._id.toString())
    } catch (err) {
      return undefined
    }

    return {
      ...dbObject,
      channelInstance: guildInstance && dbObject.channel && responsible
        ? (guildInstance.channels.resolve((dbObject.channel as Long).toString()) as TextChannel)
        : undefined,
      roleInstance: guildInstance && dbObject.role && responsible
        ? dbObject.role.toString() === '1'
          ? guildInstance.roles.everyone
          : guildInstance.roles.resolve((dbObject.role as Long).toString())
        : undefined,
      currency: Const.currencies[(dbObject.settings >> 5 & 0b1111)] || Const.currencies[0],
      price: Const.priceClasses[(dbObject.filter >> 2 & 0b11)] || Const.priceClasses[2],
      react: (dbObject.settings & (1 << 9)) !== 0,
      trashGames: (dbObject.filter & (1 << 0)) !== 0,
      theme: Const.themes[dbObject.settings & 0b11111] || Const.themes[0],
      language: LanguageManager.languageById((dbObject.settings >> 10 & 0b111111)),
      platformsRaw: (dbObject.filter >> 4 & 0b11111111),
      platformsList: this.platformsRawToList(dbObject.filter >> 4 & 0b11111111),
      beta: (dbObject.settings & (1 << 30)) !== 0
    }
  }

  public platformsRawToList(raw: number): Platform[] {
    const out = [] as Platform[]
    for (const platform of Const.platforms) {
      if ((raw & platform.bit) !== 0)
        out.push(platform)
    }

    return out
  }

  /**
   * Change a guild's setting
   * @param guild guild instance
   * @param current current guild data object
   * @param setting the setting to change
   * @param value it's new value
   */
  public async changeSetting(guild: Guild, current: GuildData, setting: 'channel', value: string | null)
  public async changeSetting(guild: Guild, current: GuildData, setting: 'role', value: string | null)
  public async changeSetting(guild: Guild, current: GuildData, setting: 'price', value: PriceClass)
  public async changeSetting(guild: Guild, current: GuildData, setting: 'theme', value: number | Theme)
  public async changeSetting(guild: Guild, current: GuildData, setting: 'currency', value: number | Currency)
  public async changeSetting(guild: Guild, current: GuildData, setting: 'react', value: boolean)
  public async changeSetting(guild: Guild, current: GuildData, setting: 'trash', value: boolean)
  public async changeSetting(guild: Guild, current: GuildData, setting: 'language', value: number)
  public async changeSetting(guild: Guild, current: GuildData, setting: 'platforms', value: Platform[] | number)
  public async changeSetting(guild: Guild, current: GuildData, setting: 'beta', value: boolean)
  public async changeSetting(guild: Guild, current: GuildData, setting: GuildSetting, value: any) {
    const out = {} as any
    let bits = 0
    const c = current.settings

    switch (setting) {
      case 'channel':
        out.channel = value ? Long.fromString(value as string) : null
        current.channel = out.channel
        current.channelInstance = (value ? await Core.channels.fetch(value) : null) as TextChannel
        break
      case 'role':
        out.role = value ? Long.fromString(value as string) : null
        current.role = out.role
        current.roleInstance = (value ? await guild.roles.fetch(value) : null) as Role
        break
      case 'price':
        bits = (value as PriceClass).id
        out.settings = Util.modifyBits(c, 2, 2, bits)
        current.price = value as PriceClass
        break
      case 'theme':
        if (typeof value !== 'number')
          value = (value as Theme).id
        bits = (value as number) & 0b11111
        out.settings = Util.modifyBits(c, 0, 5, bits)
        current.theme = Const.themes[value]
        break
      case 'currency':
        if (typeof value !== 'number')
          value = (value as Currency).id
        bits = (value as number) & 0b1111
        out.settings = Util.modifyBits(c, 5, 4, bits)
        current.currency = Const.currencies[value]
        break
      case 'react':
        bits = value ? 1 : 0
        out.settings = Util.modifyBits(c, 9, 1, bits)
        current.react = !!value
        break
      case 'trash':
        bits = value ? 1 : 0
        out.filter = Util.modifyBits(c, 0, 1, bits)
        current.trashGames = !!value
        break
      case 'language':
        bits = (value as number) & 0b111111
        out.settings = Util.modifyBits(c, 10, 6, bits)
        current.language = LanguageManager.languageById(value)
        break
      case 'platforms':
        if (typeof value === 'number') {
          bits = value & 0b11111111
        } else {
          for (const platform of (value as Platform[]))
            bits ^= platform.bit
        }
        out.filter = Util.modifyBits(c, 4, 8, bits)
        current.platformsRaw = bits
        current.platformsList = this.platformsRawToList(bits)
        break
      case 'beta':
        bits = value ? 1 : 0
        out.settings = Util.modifyBits(c, 30, 1, bits)
        current.beta = !!value
        break
    }

    await Database
      .collection('guilds')
      ?.updateOne({ _id: Long.fromString(guild.id) }, { $set: out })
  }

  // settings: (do not use bit 31, causes unwanted effects with negative number conversion)
  // 3__ 2__________________ 1__________________ 0__________________
  // 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0
  //   _                             ___________ _ _______ _________
  // 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
  //   |                             |           | |       |
  //   |                             |           | |       theme [0< 5]
  //   |                             |           | |
  //   |                             |           | currency [5< 4]
  //   |                             |           react with :free: emoji [9< 1]
  //   |                             language [10< 6]
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
