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
    // look all threads up
    const promises = directives.lookup_threads.split(' ')
      .map(threadId => ChannelsApi.lookupThread(guild, threadId, parsed, directives))

    // wait until all are resolved
    const resolved = await Promise.all(promises)

    // filter out ones that failed
    const out = resolved.filter(Boolean)

    // return if at least one succeeded
    return out.length ? out : null
  }

  private static async lookupThread(guild: string, threadId: string, parsed: DataChannel[], directives: Directives): Promise<DataChannel | null> {
    // the requested thread to look up is actually a regular channel (no need to fetch threads)
    if (parsed.some(fetched => fetched.id === threadId))
      return null

    const threads = await ThreadsApi.fetchThreads(guild, directives, true)

    // error loading threads (or no threads found)
    if (!threads || typeof threads === 'number')
      return null

    const thread = threads.find(thread => thread.id === threadId)

    // no thread by that id found or error
    if (!thread || typeof thread === 'number')
      return null

    const parent = parsed.find(channel => channel.id === thread.parentId)
    if (parent) {
      thread.position = parent.position
      thread.topic = parent.topic
      thread.nsfw = parent.nsfw
    }

    return thread
  }

}
