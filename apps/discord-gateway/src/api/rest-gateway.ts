import { Logger } from "@freestuffbot/common"
import axios from "axios"
import { config } from ".."
import RestCache from "../cache/rest-cache"


type RestRequest = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  endpoint: string
  bucket: string
  payload?: any
  noCache?: boolean
  softCache?: boolean
}

type RestResponse = {
  status: number
  data: any
}

type RestRequestResolveable = RestRequest & {
  resolve: (res: RestResponse) => any
}

/**
 * This gateway wrapper has super simplified rate limit handling.
 * It is enough for our usecase but could be improved by a lot.
 * Feel free to do so if you are reading this and would like to give it a try.
 */
export default class RestGateway {

  private static readonly HTTP_429_TOO_MANY_REQUESTS = 429

  private static outgoingQueue: RestRequestResolveable[] = []

  public static startLoop() {
    // this is so badly solved, please someone implement this entire class properly thanks
    const frequency = 5
    const bucketsBlocked = new Set()
    let blocked = false
    let remaining = 0
    let offset = 0
    let item: RestRequestResolveable = undefined

    setInterval(() => {
      if (!RestGateway.outgoingQueue.length) return

      if (blocked) return
      blocked = true

      bucketsBlocked.clear()
      remaining = ~~(config.globalRateLimit / frequency)
      offset = 0

      while (remaining > 0 && RestGateway.outgoingQueue.length > offset) {
        item = RestGateway.outgoingQueue[offset]

        if (item.bucket && bucketsBlocked.has(item.bucket)) {
          offset++
          continue
        }

        if (item.bucket)
          bucketsBlocked.add(item.bucket)

        RestGateway.outgoingQueue.splice(offset, 1)

        const res = RestGateway.checkRestCache(item)
        if (res) {
          item.resolve(res)
        } else {
          RestGateway.execute(item).then(item.resolve)
          remaining--
        }
      }

      blocked = false
    }, ~~(1000 / frequency))
  }

  public static async queue(request: RestRequest, maxRetries = 7): Promise<RestResponse> {
    const res: RestResponse = await new Promise((resolve) => {
      RestGateway.outgoingQueue.push({
        ...request,
        resolve
      })
    })

    // just to make sure, should not occur but as a backup this will do
    if (res.status !== RestGateway.HTTP_429_TOO_MANY_REQUESTS || maxRetries <= 0)
      return res

    return RestGateway.queue(request, maxRetries - 1)
  }

  private static checkRestCache(request: RestRequest | RestRequestResolveable): RestResponse | null {
    if (request.noCache || request.method !== 'GET')
      return null

    const cached = RestCache.get(request.endpoint, request.softCache)
    if (cached === undefined)
      return null

    return cached
  }

  private static async execute(request: RestRequest | RestRequestResolveable): Promise<RestResponse> {
    Logger.excessive(`HIT HTTP ${request.method}: ${request.endpoint}`)

    try {
      const res = await axios({
        method: request.method,
        url: RestGateway.buildFullUrl(request.endpoint),
        data: request.payload,
        validateStatus: null,
        headers: {
          'Authorization': `Bot ${config.apiToken}`,
          'User-Agent': 'FreeStuffCustom (https://freestuffbot.xyz/, 1.0)'
        }
      })

      if (request.method === 'GET')
        RestCache.set(request.endpoint, { status: res.status, data: res.data })

      return res
    } catch (ex) {
      Logger.warn('Issue with axios upstream @rest-gateway::execute')
      // eslint-disable-next-line no-console
      console.error(ex)
    }
  }

  private static buildFullUrl(path: string) {
    return config.baseUrl + path
  }

}
