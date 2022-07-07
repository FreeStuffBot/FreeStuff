import { DataGuild } from "@freestuffbot/common"
import GuildData from "../data/guild-data"
import Metrics from "../lib/metrics"
import RestGateway from "./rest-gateway"


export default class GuildApi {

  public static async fetchData(guild: string, retry = true): Promise<DataGuild | null> {
    const res = await RestGateway.queue({
      method: 'GET',
      bucket: guild,
      endpoint: `/guilds/${guild}`
    })

    Metrics.counterDgRequests.inc({ method: 'GET', endpoint: 'guilds', status: res.status })

    if (res.status >= 400 && res.status < 500)
      return null

    if (res.status >= 200 && res.status < 300)
      return GuildData.parseRaw(res.data)

    if (retry)
      return await this.fetchData(guild, false)

    return undefined
  }

}
