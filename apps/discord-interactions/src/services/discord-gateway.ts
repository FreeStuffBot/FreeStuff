import { Fragile, DataGuild, DataChannel } from "@freestuffbot/common"
import axios from "axios"
import { config } from ".."
import Errors from "../lib/errors"


export default class DiscordGateway {

  public static async fetchGuild(guildid: string): Promise<Fragile<DataGuild>> {
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
  }

  public static async fetchChannels(guildid: string): Promise<Fragile<DataChannel[]>> {
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
  }

}
