import axios, { AxiosResponse, Method } from "axios"
import { config } from ".."


type RestRequest = {
  method: Method
  endpoint: string
  bucket: string
  payload?: any
}

type RestRequestResolveable = RestRequest & {
  resolve: (res: AxiosResponse) => any
}

/**
 * This gateway wrapper has super simplified rate limit handling.
 * It is enough for our usecase but could be improved by a lot.
 * Feel free to do so if you are reading this and would like to give it a try.
 */
export default class RestGateway {

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
        RestGateway.execute(item).then(item.resolve)
        remaining--
      }

      blocked = false
    }, ~~(1000 / frequency))
  }

  public static async queue(request: RestRequest): Promise<AxiosResponse> {
    return new Promise((resolve) => {
      RestGateway.outgoingQueue.push({
        ...request,
        resolve
      })
    })
  }

  private static execute(request: RestRequest | RestRequestResolveable): Promise<AxiosResponse> {
    return axios({
      method: request.method,
      url: RestGateway.buildFullUrl(request.endpoint),
      data: request.payload,
      validateStatus: null,
      headers: {
        'Authorization': `Bot ${config.apiToken}`,
        'User-Agent': 'FreeStuffCustom (https://freestuffbot.xyz/, 1.0)'
      }
    })
  }

  private static buildFullUrl(path: string) {
    return config.baseUrl + path
  }

}
