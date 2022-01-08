import { config } from ".."
import MemberData from "../data/member-data"
import { DataMember } from "@freestuffbot/typings/types/internal/gateway-discord"
import RestGateway from "./rest-gateway"


export default class MemberApi {

  public static async fetchData(guild: string, retry = true): Promise<DataMember | null> {
    const res = await RestGateway.queue({
      method: 'GET',
      bucket: guild,
      endpoint: `/guilds/${guild}/members/${config.apiUser}`
    })

    if (res.status >= 400 && res.status < 500)
      return null

    if (res.status >= 200 && res.status < 300)
      return MemberData.parseRaw(res.data)

    if (retry)
      return await this.fetchData(guild, false)

    return undefined
  }

}
