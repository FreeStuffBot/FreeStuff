import { DataChannel } from "@freestuffbot/common"
import ChannelsData from "../data/channels-data"
import { MagicNumber } from "../lib/magic-number"
import Metrics from "../lib/metrics"
import RestGateway from "./rest-gateway"


export default class ChannelsApi {

  public static async fetchChannels(guild: string, directives: string[], retry = true): Promise<DataChannel[] | null | MagicNumber> {
    const res = await RestGateway.queue({
      method: 'GET',
      bucket: guild,
      endpoint: `/guilds/${guild}/channels`
    })

    Metrics.counterDgRequests.inc({ method: 'GET', endpoint: 'channels', status: res.status })

    if (res.status >= 400 && res.status < 500)
      return null

    if (res.status >= 200 && res.status < 300)
      return ChannelsData.parseRaw(res.data, guild, directives)

    if (retry)
      return await this.fetchChannels(guild, directives, false)

    return undefined
  }

}
