import { DataChannel } from "@freestuffbot/common"
import ChannelsData from "../data/channels-data"
import { MagicNumber } from "../lib/magic-number"
import Metrics from "../lib/metrics"
import { Directives } from "../types/lib"
import RestGateway from "./rest-gateway"
import ThreadsApi from "./threads-api"


export default class ChannelsApi {

  public static async fetchChannels(guild: string, directives: Directives, retry = true): Promise<DataChannel[] | null | MagicNumber> {
    const res = await RestGateway.queue({
      method: 'GET',
      bucket: guild,
      endpoint: `/guilds/${guild}/channels`
    })

    Metrics.counterDgRequests.inc({ method: 'GET', endpoint: 'channels', status: res.status })

    if (res.status >= 400 && res.status < 500)
      return null

    // success
    if (res.status >= 200 && res.status < 300) {
      const parsed = await ChannelsData.parseRaw(res.data, guild, directives)

      // return if either no lookup is requested or a magic number is resolved
      if (!directives.lookup_threads || typeof parsed === 'number')
        return parsed

      const threads = await ChannelsApi.lookupThreads(guild, parsed, directives)
      if (threads)
        parsed.push(...threads)

      return parsed
    }

    if (retry)
      return await ChannelsApi.fetchChannels(guild, directives, false)

    return undefined
  }

  private static async lookupThreads(guild: string, parsed: DataChannel[], directives: Directives): Promise<DataChannel[] | null> {
    const uniqueThreadIds = [ ...new Set(directives.lookup_threads.split(' ')) ]

    // filter out threads that are actually regular channels (no need to fetch threads)
    const ids = uniqueThreadIds.filter(threadId => !parsed.some(channel => channel.id === threadId))

    // all requested lookups were real channels
    if (!ids.length)
      return null

    const allThreads = await ThreadsApi.fetchThreads(guild, directives, true)

    // error loading threads (or no threads found)
    if (!allThreads || typeof allThreads === 'number')
      return null

    const resolvedThreads = ids
      .map(threadId => allThreads.find(thread => thread.id === threadId))
      .filter(Boolean)

    // no threads found or error
    if (!resolvedThreads || typeof resolvedThreads === 'number' || resolvedThreads.length === 0)
      return null

    for (const thread of resolvedThreads) {
      const parent = parsed.find(channel => channel.id === thread.parentId)
      if (!parent) continue

      thread.position = parent.position
      thread.topic = parent.topic
      thread.nsfw = parent.nsfw
    }

    return resolvedThreads
  }

}
