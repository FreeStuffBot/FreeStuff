import { DataMember } from "@freestuffbot/common"
import { config } from ".."
import MemberData from "../data/member-data"
import Metrics from "../lib/metrics"
import { Directives } from "../types/lib"
import RestGateway from "./rest-gateway"


export default class MemberApi {

  public static async fetchData(guild: string, directives: Directives, retry = true): Promise<DataMember | null> {
    const res = await RestGateway.queue({
      method: 'GET',
      bucket: guild,
      endpoint: `/guilds/${guild}/members/${config.apiUser}`,
      noCache: !directives.nocache,
      softCache: !directives.softcache
    })

    Metrics.counterDgRequests.inc({ method: 'GET', endpoint: 'member', status: res.status })

    if (res.status >= 400 && res.status < 500)
      return null

    if (res.status >= 200 && res.status < 300)
      return MemberData.parseRaw(res.data)

    if (retry)
      return await this.fetchData(guild, directives, false)

    return undefined
  }

}
