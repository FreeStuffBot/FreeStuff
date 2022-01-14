import { config } from ".."
import { DataMember } from "@freestuffbot/typings/types/internal/gateway-discord"


export default class GuilddataCache {

  private static cacheData: Map<string, DataMember> = new Map()
  private static cacheAge: Map<string, number> = new Map()

  /**
   * @returns data on success, null on cache hit but empty data, undefined on non cache hit
   */
  public static get(guild: string, softcache = false): DataMember | null | undefined {
    if (!GuilddataCache.cacheData.has(guild)) return undefined
    if (Date.now() - GuilddataCache.cacheAge.get(guild) > (softcache ? config.cacheTtlMemberMin : config.cacheTtlMemberMax)) return undefined
    return GuilddataCache.cacheData.get(guild)
  }

  public static set(guild: string, data: DataMember | null) {
    GuilddataCache.cacheData.set(guild, data)
    GuilddataCache.cacheAge.set(guild, Date.now())
  }

  public static purge() {
    for (const guild of GuilddataCache.cacheAge.keys()) {
      if (Date.now() - GuilddataCache.cacheAge.get(guild) < config.cacheTtlMemberMax) return

      GuilddataCache.cacheData.delete(guild)
      GuilddataCache.cacheAge.delete(guild)
    }
  }

}
