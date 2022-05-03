import { DataMember } from "@freestuffbot/common"
import { config } from ".."


export default class MemberCache {

  private static cacheData: Map<string, DataMember> = new Map()
  private static cacheAge: Map<string, number> = new Map()

  /**
   * @returns data on success, null on cache hit but empty data, undefined on non cache hit
   */
  public static get(guild: string, softcache = false): DataMember | null | undefined {
    if (!MemberCache.cacheData.has(guild)) return undefined
    if (Date.now() - MemberCache.cacheAge.get(guild) > (softcache ? config.cacheTtlMemberMin : config.cacheTtlMemberMax)) return undefined
    return MemberCache.cacheData.get(guild)
  }

  public static set(guild: string, data: DataMember | null) {
    MemberCache.cacheData.set(guild, data)
    MemberCache.cacheAge.set(guild, Date.now())
  }

  public static purge() {
    for (const guild of MemberCache.cacheAge.keys()) {
      if (Date.now() - MemberCache.cacheAge.get(guild) < config.cacheTtlMemberMax) return

      MemberCache.cacheData.delete(guild)
      MemberCache.cacheAge.delete(guild)
    }
  }

  public static get size(): number {
    return MemberCache.cacheData.size
  }

}
