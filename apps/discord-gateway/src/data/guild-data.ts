import { DataGuild } from "@freestuffbot/common"
import GuildApi from "../api/guild-api"
import { MagicNumber, MAGICNUMBER_BAD_GATEWAY } from "../lib/magic-number"
import { Directives } from "../types/lib"


export default class GuildData {

  public static parseRaw(raw: any): DataGuild {
    if (typeof raw !== "object") return null
    return {
      id: raw.id,
      name: raw.name,
      icon: raw.icon,
      description: raw.description,
      ownerId: raw.owner_id,
      roles: raw.roles.map(r => ({
        id: r.id,
        name: r.name,
        permissions: r.permissions,
        managed: r.managed,
        position: r.position,
        mentionable: r.mentionable,
        icon: r.icon,
        unicodeEmoji: r.unicode_emoji
      })),
      preferredLocale: raw.preferred_locale,
      rulesChannelId: raw.rules_channel_id,
      systemChannelId: raw.system_channel_id,
      publicUpdatesChannelId: raw.public_updates_channel_id
    }
  }

  /**
   * 
   */

  public static async findGuild(guild: string, directives: Directives): Promise<DataGuild | MagicNumber | null> {
    // if (!directives.includes('nocache')) {
    //   const cache = GuildCache.get(guild, directives.includes('softcache'))
    //   if (cache !== undefined) return cache
    // }

    const fresh = await GuildApi.fetchData(guild, directives)
    if (fresh === undefined) return MAGICNUMBER_BAD_GATEWAY

    // GuildCache.set(guild, fresh)
    return fresh
  }

}
