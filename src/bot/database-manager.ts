import { Guild, TextChannel } from 'discord.js'
import { Long } from 'mongodb'
import { CronJob } from 'cron'
import { Store } from 'freestuff'
import { Core } from '../index'
import FreeStuffBot from '../freestuffbot'
import Database from '../database/database'
import { DatabaseGuildData, GuildData } from '../types/datastructs'
import { FilterableStore, GuildSetting } from '../types/context'
import { Util } from '../lib/util'
import Logger from '../lib/logger'


export default class DatabaseManager {

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
  public addGuild(guild: Guild, autoSettings = true) {
    const settings = autoSettings
      ? Core.localisation.getDefaultSettings(guild)
      : 0
    const data: DatabaseGuildData = {
      _id: Long.fromString(guild.id),
      sharder: Long.fromString(guild.id).shiftRight(22),
      channel: null,
      role: null,
      price: 3,
      settings
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
  public removeGuild(guildid: Long, force = false) {
    if (!force && !Util.belongsToShard(guildid)) return
    Database
      .collection('guilds')
      ?.deleteOne({ _id: guildid })
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

  /**
   * Get the guilds data from the database
   * @param guild guild object
   */
  public async getGuildData(guild: string, fetchInstances = true): Promise<GuildData> {
    if (!guild) return undefined
    const obj = await this.getRawGuildData(guild)
    if (!obj) return undefined
    return this.parseGuildData(obj, fetchInstances)
  }

  /**
   * Parse a DatabaseGuildData object to a GuildData object
   * @param dbObject raw input
   */
  public async parseGuildData(dbObject: DatabaseGuildData, fetchInstances = true): Promise<GuildData> {
    if (!dbObject) return undefined
    const responsible = (Core.options.shardCount === 1) || Util.belongsToShard(dbObject._id)
    let guildInstance: Guild
    try {
      if (fetchInstances)
        guildInstance = await Core.guilds.fetch(dbObject._id.toString())
    } catch (err) {
      return undefined
    }

    return {
      ...dbObject,
      channelInstance: fetchInstances && dbObject.channel && responsible && guildInstance
        ? (guildInstance.channels.resolve((dbObject.channel as Long).toString()) as TextChannel)
        : undefined,
      roleInstance: fetchInstances && dbObject.role && responsible && guildInstance
        ? dbObject.role.toString() === '1'
          ? guildInstance.roles.everyone
          : guildInstance.roles.resolve((dbObject.role as Long).toString())
        : undefined,
      currency: ((dbObject.settings & (1 << 4)) === 0 ? 'euro' : 'usd') as ('euro' | 'usd'),
      react: (dbObject.settings & (1 << 5)) !== 0,
      trashGames: (dbObject.settings & (1 << 6)) !== 0,
      theme: dbObject.settings & 0b1111,
      language: Core.languageManager.languageById((dbObject.settings >> 8 & 0b111111)),
      storesRaw: (dbObject.settings >> 14 & 0b11111111),
      storesList: this.storesRawToList(dbObject.settings >> 14 & 0b11111111),
      beta: (dbObject.settings & (1 << 30)) !== 0
    }
  }

  public storesRawToList(raw: number): Store[] {
    const out = [] as Store[]
    if ((raw & FilterableStore.STEAM) !== 0) out.push('steam')
    if ((raw & FilterableStore.EPIC) !== 0) out.push('epic')
    if ((raw & FilterableStore.HUMBLE) !== 0) out.push('humble')
    if ((raw & FilterableStore.GOG) !== 0) out.push('gog')
    if ((raw & FilterableStore.ORIGIN) !== 0) out.push('origin')
    if ((raw & FilterableStore.UPLAY) !== 0) out.push('uplay')
    if ((raw & FilterableStore.ITCH) !== 0) out.push('itch')
    if ((raw & FilterableStore.OTHER) !== 0) {
      out.push('apple')
      out.push('discord')
      out.push('google')
      out.push('ps')
      out.push('xbox')
      out.push('switch')
      out.push('twitch')
      out.push('other')
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
  public changeSetting(guild: Guild, current: GuildData, setting: GuildSetting, value: string | number | boolean) {
    const out = {} as any
    let bits = 0
    const c = current.settings

    switch (setting) {
      case 'channel':
        out.channel = Long.fromString(value as string)
        break
      case 'roleMention':
        out.role = value ? Long.fromString(value as string) : null
        break
      case 'price':
        out.price = value as number
        break
      case 'theme':
        bits = (value as number) & 0b1111
        out.settings = Util.modifyBits(c, 0, 4, bits)
        break
      case 'currency':
        bits = value ? 1 : 0
        out.settings = Util.modifyBits(c, 4, 1, bits)
        break
      case 'react':
        bits = value ? 1 : 0
        out.settings = Util.modifyBits(c, 5, 1, bits)
        break
      case 'trash':
        bits = value ? 1 : 0
        out.settings = Util.modifyBits(c, 6, 1, bits)
        break
      case 'language':
        bits = (value as number) & 0b111111
        out.settings = Util.modifyBits(c, 8, 6, bits)
        break
      case 'stores':
        bits = (value as number) & 0b11111111
        out.settings = Util.modifyBits(c, 14, 8, bits)
        break
      case 'beta':
        bits = value ? 1 : 0
        out.settings = Util.modifyBits(c, 30, 1, bits)
        break
    }

    Database
      .collection('guilds')
      ?.updateOne({ _id: Long.fromString(guild.id) }, { $set: out })
  }

  // settings: (do not use bit 31, causes unwanted effects with negative number conversion)
  // 3__ 2__________________ 1__________________ 0__________________
  // 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0
  //   _                 _______________ ___________ _ _ _ _ _______
  // 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
  //   |                 |               |           | | | |  theme [0< 4]
  //   |                 |               |           | | | currency (on = usd, off = eur) [4< 1]
  //   |                 |               |           | | react with :free: emoji [5< 1]
  //   |                 |               |           | show trash games [6< 1]
  //   |                 |               |           alternative date format [7< 1] (DEPRECATED, bit can be used but needs to be reset first)
  //   |                 |               language [8< 6]
  //   |                 stores [14< 8] (itch uplay origin gog humble epic steam other)
  //   opted in to beta tests

}
