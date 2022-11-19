import { DataChannel, DataGuild, DataMember } from "@freestuffbot/common"
import ChannelsApi from "../api/channels-api"
import { calculatePermissionsForMemberInChannel, containerToBitfield } from "../lib/discord-permissions"
import { MagicNumber, MAGICNUMBER_BAD_GATEWAY } from "../lib/magic-number"
import { Directives } from "../types/lib"
import GuildData from "./guild-data"
import MemberData from "./member-data"


export default class ChannelsData {

  public static async parseRaw(raw: any, guildId: string, directives: Directives, keepParent = false): Promise<DataChannel[] | null | MagicNumber> {
    if (typeof raw !== "object") return null

    const [ guild, member ] = await Promise.all([
      GuildData.findGuild(guildId, directives),
      MemberData.findMember(guildId, directives)
    ])

    if (!guild || !member) return null
    if (typeof guild === 'number') return guild
    if (typeof member === 'number') return member

    return raw.map(item => ChannelsData.parseSingle(member, item, guild, keepParent))
  }

  public static parseSingle(member: DataMember, raw: any, guild: DataGuild, keepParent: boolean): DataChannel {
    const permissionsRaw = calculatePermissionsForMemberInChannel(member, raw, guild)
    const permissions = containerToBitfield(permissionsRaw)

    return {
      id: raw.id,
      name: raw.name,
      type: raw.type,
      parentId: keepParent ? raw.parent_id : null,
      position: raw.position,
      topic: raw.topic,
      nsfw: raw.nsfw,
      permissions
    }
  }

  /**
   * 
   */

  public static async findChannels(guild: string, directives: Directives): Promise<DataChannel[] | MagicNumber | null> {
    // if (!directives.includes('nocache')) {
    //   const cache = ChannelsCache.get(guild, directives.includes('softcache'))
    //   if (cache !== undefined) return cache
    // }

    const fresh = await ChannelsApi.fetchChannels(guild, directives)
    if (fresh === undefined) return MAGICNUMBER_BAD_GATEWAY
    if (typeof fresh === 'number') return fresh as MagicNumber

    // ChannelsCache.set(guild, fresh)
    return fresh
  }

}
