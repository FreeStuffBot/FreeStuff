import { DataMember } from "@freestuffbot/common"
import MemberApi from "../api/member-api"
import { MagicNumber, MAGICNUMBER_BAD_GATEWAY } from "../lib/magic-number"
import { Directives } from "../types/lib"


export default class MemberData {

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

  public static async findMember(guild: string, directives: Directives): Promise<DataMember | MagicNumber | null> {
    // if (!directives.includes('nocache')) {
    //   const cache = MemberCache.get(guild, directives.includes('softcache'))
    //   if (cache !== undefined) return cache
    // }

    const fresh = await MemberApi.fetchData(guild, directives)
    if (fresh === undefined) return MAGICNUMBER_BAD_GATEWAY

    // MemberCache.set(guild, fresh)
    return fresh
  }

}
