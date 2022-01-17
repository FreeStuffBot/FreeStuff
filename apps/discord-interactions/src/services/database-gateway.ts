import { FlipflopCache, Fragile, GuildType, SanitizedGuildType, GuildSanitizer, GuildDataType } from "@freestuffbot/common"
import { Long } from "bson"
import { config } from ".."
import Errors from "../lib/errors"
import Mongo from "./mongo"


export default class DatabaseGateway {

  private static guildCache: FlipflopCache<SanitizedGuildType> = new FlipflopCache(config.discordGuildCacheInterval)

  public static async getGuild(guildid: string): Promise<Fragile<SanitizedGuildType>> {
    if (DatabaseGateway.guildCache.has(guildid))
      return Errors.success(DatabaseGateway.guildCache.get(guildid))

    const fresh = await this.fetchGuild(guildid)
    if (fresh[0]) return fresh

    DatabaseGateway.guildCache.put(guildid, fresh[1])
    return fresh
  }

  public static async fetchGuild(guildid: string): Promise<Fragile<SanitizedGuildType>> {
    const raw = await Mongo.findById('guilds', Long.fromString(guildid))

    if (!raw)
      return Errors.throwStderrNoGuilddata('discord-interactions::database-gateway')

    const sanitized = GuildSanitizer.sanitize(raw)
    return Errors.success(sanitized)
  }
  
  public static pushGuildDataChange(guildid: string, key: string, value: any) {
  }

  // public static async fetchLanguageData(): Promise<Fragile<Record<string, Record<string, string>>>> {
  //   // TODO fetch from proxy
  //   // TODO parse raw data
  //   return Errors.throwStderrNotInitialized()
  // }

}
