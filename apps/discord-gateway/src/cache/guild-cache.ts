import { DataGuild } from "@freestuffbot/common"
import { config } from ".."


export default class GuildCache {

  private static cacheData: Map<string, DataGuild> = new Map()
  private static cacheAge: Map<string, number> = new Map()

  /**
   * @returns data on success, null on cache hit but empty data, undefined on non cache hit
   */
  public static get(guild: string, softcache = false): DataGuild | null | undefined {
    if (!GuildCache.cacheData.has(guild)) return undefined
    if (Date.now() - GuildCache.cacheAge.get(guild) > (softcache ? config.cacheTtlGuildMin : config.cacheTtlGuildMax)) return undefined
    return GuildCache.cacheData.get(guild)
  }

  public static set(guild: string, data: DataGuild | null) {
    GuildCache.cacheData.set(guild, data)
    GuildCache.cacheAge.set(guild, Date.now())
  }

  public static purge() {
    for (const guild of GuildCache.cacheAge.keys()) {
      if (Date.now() - GuildCache.cacheAge.get(guild) < config.cacheTtlGuildMax) return

      GuildCache.cacheData.delete(guild)
      GuildCache.cacheAge.delete(guild)
    }
  }

  public static get size(): number {
    return GuildCache.cacheData.size
  }

}
