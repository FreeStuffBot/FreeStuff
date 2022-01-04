import ChannelsData from "../data/channels-data"
import { DataChannel } from "../types/data"
import RestGateway from "./rest-gateway"


export default class ChannelsAPI {

  public static async fetchChannels(guild: string, retry = true): Promise<DataChannel[] | null> {
    const res = await RestGateway.queue({
      method: 'GET',
      bucket: guild,
      endpoint: `/guilds/${guild}/channels`
    })

    if (res.status >= 400 && res.status < 500)
      return null

    if (res.status >= 200 && res.status < 300)
      return ChannelsData.parseRaw(res.data)

    if (retry)
      return this.fetchChannels(guild, false)

    return undefined
  }

}
