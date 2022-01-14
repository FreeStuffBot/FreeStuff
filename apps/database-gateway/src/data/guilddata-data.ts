import GuilddataCache from "../cache/guilddata-cache"
import { MagicNumber, MAGICNUMBER_BAD_GATEWAY } from "../lib/magic-number"
import { DataMember } from "@freestuffbot/typings/types/internal/gateway-discord"


export default class GuilddataData {

  public static parseRaw(raw: any): DataMember {
    if (typeof raw !== "object") return null
    return {
      id: raw.user.id,
      roles: raw.roles
    }
  }

  /**
   * 
   */

  public static async findGuilddata(guild: string, directives: string[]): Promise<DataMember | MagicNumber | null> {
    if (!directives.includes('nocache')) {
      const cache = GuilddataCache.get(guild, directives.includes('softcache'))
      if (cache !== undefined) return cache
    }

    const fresh = await MemberApi.fetchData(guild)
    if (fresh === undefined) return MAGICNUMBER_BAD_GATEWAY

    GuilddataCache.set(guild, fresh)
    return fresh
  }

}
