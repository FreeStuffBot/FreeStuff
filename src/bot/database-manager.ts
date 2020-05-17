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
      // Same with leaving guilds and removing them from the db then

      const dbGuilds = await this.getAssignedGuilds();

      for (const guild of bot.guilds.values()) {
        if (!dbGuilds.find(g => g._id.toString() == guild.id))
          this.addGuild(guild);
      }

      // for (const guild of dbGuilds) {
      //   if (!bot.guilds.get(guild._id.toString()))
      //     this.removeGuild(guild._id);
      // }
    });

    bot.on('guildCreate', async guild => {
      if (await Database
          .collection('guilds')
          .findOne({ _id: Long.fromString(guild.id) }))
        return;

      this.addGuild(guild);
    });

    // bot.on('guildDelete', guild => {
    //   this.removeGuild(Long.fromString(guild.id));
    // });

    /** Guild remover */
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

  public async getAssignedGuilds(): Promise<DatabaseGuildData[]> {
    return await Database
        .collection('guilds')
        .find(
          Core.singleShard
            ? { }
            : { _id: { $mod: [Core.options.shardCount, Core.options.shardId] } }
        )
        .toArray();
  }

  /**
   * Add a guild to the database
   * @param guild guild object
   */
  public addGuild(guild: Guild) {
    const data: DatabaseGuildData = {
      _id: Long.fromString(guild.id),
      channel: null,
      role: null,
      price: 3,
      settings: 0
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
      currency: (dbObject.settings & 0b10000) == 0 ? 'euro' : 'usd',
      react: (dbObject.settings & 0b100000) != 0,
      trashGames: (dbObject.settings & 0b1000000) != 0,
      theme: dbObject.settings & 0b1111
    }
  }

  public changeSetting(guild: Guild, current: GuildData, setting: GuildSetting, value: string | number | boolean) {
    const out = {};
    switch (setting) {
      case 'channel':
        out['channel'] = Long.fromString(value as string);
        break;
      case 'roleMention':
        out['role'] = value ? Long.fromString(value as string) : null;
        break;
      case 'theme':
        out['settings'] = ((current.settings >> 4) << 4) + (value as number);
        break;
      case 'currency':
        out['settings'] = (current.settings | 0b10000) ^ (value ? 0 : 0b10000);
        break;
      case 'react':
        out['settings'] = (current.settings | 0b100000) ^ (value ? 0 : 0b100000);
        break;
      case 'trash':
        out['settings'] = (current.settings | 0b1000000) ^ (value ? 0 : 0b1000000);
        break;
      case 'price':
        out['price'] = value as number;
        break;
    }
    Database
      .collection('guilds')
      .updateOne({ _id: Long.fromString(guild.id) }, { '$set': out });
  }

}