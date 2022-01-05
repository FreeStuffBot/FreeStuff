import GuildData from "../data/guild-data"
import { DataGuild } from "../types/data"
import RestGateway from "./rest-gateway"


export default class GuildApi {

  public static async fetchData(guild: string, retry = true): Promise<DataGuild | null> {
    const res = await RestGateway.queue({
      method: 'GET',
      bucket: guild,
      endpoint: `/guilds/${guild}`
    })

    if (res.status >= 400 && res.status < 500)
      return null

    if (res.status >= 200 && res.status < 300)
      return GuildData.parseRaw(res.data)

    if (retry)
      return await this.fetchData(guild, false)

    return undefined
  }

}
