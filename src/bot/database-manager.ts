import { FreeStuffBot, Core } from "../index";
import { Guild, TextChannel } from "discord.js";
import Database from "../database/database";
import { Long } from "mongodb";
import { GuildSetting, GuildData, DatabaseGuildData } from "../types";
import { Util } from "../util/util";
import { CronJob } from "cron";


export default class DatabaseManager {

  public constructor(bot: FreeStuffBot) {
    bot.on('ready', async () => {
      // Check if any guild is not in the database yet
      // Might happen when someone adds the bot while it's offline

      const dbGuilds = await this.getAssignedGuilds();

      for (const guild of bot.guilds.values()) {
        if (!dbGuilds.find(g => g._id.toString() == guild.id))
          this.addGuild(guild);
      }
    });

    bot.on('guildCreate', async guild => {
      if (await Database
        .collection('guilds')
        .findOne({
          _id: Long.fromString(guild.id)
        })) return;

      this.addGuild(guild);
    });

    this.startGarbageCollector(bot);
  }

  /**
   * Start a scheduled cron task that once a day will remove all data from guilds that no longer have the bot on them from the database
   * ! Do not run this method multiple times without canceling the task first !
   * @param bot bot instance
   */
  private startGarbageCollector(bot: FreeStuffBot): void {
    new CronJob('0 0 0 * * *', async () => {
      const dbGuilds = await this.getAssignedGuilds();
      const removalQueue: DatabaseGuildData[] = [];
      for (const guild of dbGuilds) {
        if (!bot.guilds.get(guild._id.toString()))
          removalQueue.push(guild);
      }

      setTimeout(async () => {
        const dbGuilds = await this.getAssignedGuilds();
        for (const guild of dbGuilds) {
          if (!bot.guilds.get(guild._id.toString())) {
            if (removalQueue.find(g => g._id.equals(guild._id))) {
              this.removeGuild(guild._id);
            }
          }
        }
      }, 1000 * 60 * 30);
    }).start();
  }

  /**
   * Returns an array of the guilddata from each of the guilds belonging to the current shard
   */
  public async getAssignedGuilds(): Promise<DatabaseGuildData[]> {
    return Database
      .collection('guilds')
      .find(
        Core.singleShard
          ? { }
          : { sharder: { $mod: [Core.options.shardCount, Core.options.shardId] } }
      )
      .toArray();
  }

  /**
   * Add a guild to the database
   * @param guild guild object
   * @param autoSettings whether the default settings should automatically be adjusted to the server (e.g: server region -> language)
   */
  public addGuild(guild: Guild, autoSettings = true) {
    const settings = autoSettings
      ? Core.localisation.getDefaultSettings(guild)
      : 0;
    const data: DatabaseGuildData = {
      _id: Long.fromString(guild.id),
      sharder: Long.fromString(guild.id).shiftRight(22),
      channel: null,
      role: null,
      price: 3,
      settings: settings
    }
    Database
      .collection('guilds')
      .insertOne(data);
  }

  /**
   * Remove a guild from the database
   * @param guildid guild id
   * @param force weather to force a removal or not. if not forced this method will not remove guilds that are managed by another shard
   */
  public removeGuild(guildid: Long, force = false) {
    if (!force && !Util.belongsToShard(guildid)) return;
    Database
      .collection('guilds')
      .deleteOne({ _id: guildid });
  }

  /**
   * Get the raw / unparsed guilds data from the database
   * @param guild guild object
   */
  public async getRawGuildData(guild: Guild): Promise<DatabaseGuildData> {
    const obj = await Database
      .collection('guilds')
      .findOne({ _id: Long.fromString(guild.id) })
      .catch(console.error);
    if (!obj) return undefined;
    return obj;
  }

  /**
   * Get the guilds data from the database
   * @param guild guild object
   */
  public async getGuildData(guild: Guild): Promise<GuildData> {
    const obj = await this.getRawGuildData(guild);
    return obj ? this.parseGuildData(obj) : undefined;
  }

  /**
   * Parse a DatabaseGuildData object to a GuildData object
   * @param dbObject raw input
   */
  public parseGuildData(dbObject: DatabaseGuildData): GuildData {
    if (!dbObject) return undefined;
    const responsible = Core.singleShard || Util.belongsToShard(dbObject._id);
    return {
      ...dbObject,
      channelInstance: dbObject.channel && responsible
        ? (Core
            .guilds
            .get(dbObject._id.toString())
            .channels
            .get((dbObject.channel as Long).toString()) as TextChannel)
        : undefined,
      roleInstance: dbObject.role && responsible
        ? (dbObject.role.toString() == '1'
          ? Core.guilds.get(dbObject._id.toString()).defaultRole
          : Core.guilds.get(dbObject._id.toString()).roles.get((dbObject.role as Long).toString()))
        : undefined,
      currency: (dbObject.settings & (1 << 4)) == 0 ? 'euro' : 'usd',
      react: (dbObject.settings & (1 << 5)) != 0,
      trashGames: (dbObject.settings & (1 << 6)) != 0,
      altDateFormat: (dbObject.settings & (1 << 7)) != 0,
      theme: dbObject.settings & 0b1111,
      language: Core.languageManager.languageById((dbObject.settings >> 8 & 0b11111))
    }
  }

  /**
   * Change a guild's setting
   * @param guild guild instance
   * @param current current guild data object
   * @param setting the setting to change
   * @param value it's new value
   */
  public changeSetting(guild: Guild, current: GuildData, setting: GuildSetting, value: string | number | boolean) {
    const out = {};
    let bits = 0;
    const c = current.settings;
    switch (setting) {
      case 'channel':
        out['channel'] = Long.fromString(value as string);
        break;
      case 'roleMention':
        out['role'] = value ? Long.fromString(value as string) : null;
        break;
      case 'price':
        out['price'] = value as number;
        break;
      case 'theme':
        bits = (value as number) & 0b1111;
        out['settings'] = Util.modifyBits(c, 0, 4, bits);
        break;
      case 'currency':
        bits = value ? 1 : 0;
        out['settings'] = Util.modifyBits(c, 4, 1, bits);
        break;
      case 'react':
        bits = value ? 1 : 0;
        out['settings'] = Util.modifyBits(c, 5, 1, bits);
        break;
      case 'trash':
        bits = value ? 1 : 0;
        out['settings'] = Util.modifyBits(c, 6, 1, bits);
        break;
      case 'altdate':
        bits = value ? 1 : 0;
        out['settings'] = Util.modifyBits(c, 7, 1, bits);
        break;
      case 'language':
        bits = (value as number) & 0b1111;
        out['settings'] = Util.modifyBits(c, 8, 5, bits);
        break;
    }
    Database
      .collection('guilds')
      .updateOne({ _id: Long.fromString(guild.id) }, { '$set': out });
  }

  // 3__ 2__________________ 1__________________ 0__________________
  // 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0 9 8 7 6 5 4 3 2 1 0
  // settings:                             _________ _ _ _ _ _______
  // 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
  //                                       |         | | | |  theme [0< 4]
  //                                       |         | | | currency (on = usd, off = eur) [4< 1]
  //                                       |         | | react with :free: emoji [5< 1]
  //                                       |         | show trash games [6< 1]
  //                                       |         alternative date format [7< 1]
  //                                       language [8< 5]

}
