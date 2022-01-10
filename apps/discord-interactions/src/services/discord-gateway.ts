import { Fragile } from "@freestuffbot/common"
import { DataChannel, DataGuild } from "@freestuffbot/typings"
import axios from "axios"
import { config } from ".."


export default class DiscordGateway {

  public static async fetchGuild(guildid: string): Promise<Fragile<DataGuild>> {
    const { data, status } = await axios.get(`/guild/${guildid}`, {
      baseURL: config.network.discordGateway,
      validateStatus: null
    })

    if (status === 200)
      return [ null, data ]
    
    return [
      {
        status,
        name: status === 404
          ? 'not found'
          : 'bad gateway',
        source: 'discord-interactions::discord-gateway'
      },
      null
    ]
  }

  public static async fetchChannels(guildid: string): Promise<Fragile<DataChannel[]>> {
    const { data, status } = await axios.get(`/channels/${guildid}`, {
      baseURL: config.network.discordGateway,
      validateStatus: null
    })


    if (status === 200)
      return [ null, data ]
    
    return [
      {
        status,
        name: status === 404
          ? 'not found'
          : 'bad gateway',
        source: 'discord-interactions::discord-gateway'
      },
      null
    ]
  }

}
