import { Fragile, DataGuild, DataChannel, FlipflopCache } from "@freestuffbot/common"
import axios from "axios"
import { config } from ".."
import Errors from "../lib/errors"


export default class DiscordGateway {

  private static guildCache: FlipflopCache<DataGuild> = new FlipflopCache(config.discordGuildCacheInterval)

  public static async getGuild(guildid: string): Promise<Fragile<DataGuild>> {
    if (DiscordGateway.guildCache.has(guildid))
      return Errors.success(DiscordGateway.guildCache.get(guildid))

    const fresh = await this.fetchGuild(guildid)
    if (fresh[0]) return fresh

    DiscordGateway.guildCache.put(guildid, fresh[1])
    return fresh
  }

  private static async fetchGuild(guildid: string): Promise<Fragile<DataGuild>> {
    try {
      const { data, status } = await axios.get(`/guild/${guildid}`, {
        baseURL: config.network.discordGateway,
        validateStatus: null
      })

      if (status === 200)
        return Errors.success(data)
      
      return Errors.throw({
        status,
        name: status === 404
          ? 'not found'
          : 'bad gateway',
        source: 'discord-interactions::discord-gateway'
      })
    } catch (ex) {
      return Errors.throw({
        status: Errors.STATUS_ERRNO,
        name: ex.code ?? 'unknown',
        source: 'discord-interactions::discord-gateway'
      })
    }
  }

  //
  
  private static channelsCache: FlipflopCache<DataChannel[]> = new FlipflopCache(config.discordChannelsCacheInterval)

  public static async getChannels(guildid: string): Promise<Fragile<DataChannel[]>> {
    if (DiscordGateway.channelsCache.has(guildid))
      return Errors.success(DiscordGateway.channelsCache.get(guildid))

    const fresh = await this.fetchChannels(guildid)
    if (fresh[0]) return fresh

    DiscordGateway.channelsCache.put(guildid, fresh[1])
    return fresh
  }

  private static async fetchChannels(guildid: string): Promise<Fragile<DataChannel[]>> {
    try {
      const { data, status } = await axios.get(`/channels/${guildid}`, {
        baseURL: config.network.discordGateway,
        validateStatus: null
      })
  
      if (status === 200)
        return Errors.success(data)

      return Errors.throw({
        status,
        name: status === 404
          ? 'not found'
          : 'bad gateway',
        source: 'discord-interactions::discord-gateway'
      })
    } catch (ex) {
      return Errors.throw({
        status: Errors.STATUS_ERRNO,
        name: ex.code ?? 'unknown',
        source: 'discord-interactions::discord-gateway'
      })
    }
  }

}
