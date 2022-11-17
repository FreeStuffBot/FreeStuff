import { DataChannel } from "@freestuffbot/common"
import ChannelsData from "../data/channels-data"
import { MagicNumber } from "../lib/magic-number"
import Metrics from "../lib/metrics"
import { Directives } from "../types/lib"
import RestGateway from "./rest-gateway"


export default class ThreadsApi {

  public static async fetchThreads(guild: string, directives: Directives, retry = true): Promise<DataChannel[] | null | MagicNumber> {
    const res = await RestGateway.queue({
      method: 'GET',
      bucket: guild,
      endpoint: `/guilds/${guild}/threads/active`,
      noCache: !directives.nocache,
      softCache: !directives.softcache
    })

    Metrics.counterDgRequests.inc({ method: 'GET', endpoint: 'threads', status: res.status })

    if (res.status >= 400 && res.status < 500)
      return null

    if (res.status >= 200 && res.status < 300)
      return ChannelsData.parseRaw(res.data.threads, guild, directives, true)

    if (retry)
      return await this.fetchThreads(guild, directives, false)

    return undefined
  }

}
