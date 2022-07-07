import { DataChannel } from "@freestuffbot/common"
import { config } from ".."


export default class ChannelsCache {

  private static cacheData: Map<string, DataChannel[]> = new Map()
  private static cacheAge: Map<string, number> = new Map()

  /**
   * @returns data on success, null on cache hit but empty data, undefined on non cache hit
   */
  public static get(guild: string, softcache = false): DataChannel[] | null | undefined {
    if (!ChannelsCache.cacheData.has(guild)) return undefined
    if (Date.now() - ChannelsCache.cacheAge.get(guild) > (softcache ? config.cacheTtlChannelsMin : config.cacheTtlChannelsMax)) return undefined
    return ChannelsCache.cacheData.get(guild)
  }

  public static set(guild: string, data: DataChannel[] | null) {
    ChannelsCache.cacheData.set(guild, data)
    ChannelsCache.cacheAge.set(guild, Date.now())
  }

  public static purge() {
    for (const guild of ChannelsCache.cacheAge.keys()) {
      if (Date.now() - ChannelsCache.cacheAge.get(guild) < config.cacheTtlChannelsMax) return

      ChannelsCache.cacheData.delete(guild)
      ChannelsCache.cacheAge.delete(guild)
    }
  }

  public static get size(): number {
    return ChannelsCache.cacheData.size
  }

}
