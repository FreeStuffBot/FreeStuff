import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { config } from ".."
import Metrics from "./metrics"


type ResolveFunction = () => void
type QueueEntry = [ AxiosRequestConfig, ResolveFunction ]

export default class Upstream {

  /** the outgoing queue */
  private static queue: QueueEntry[] = []
  /** if a request triggers a rate limit, this value will indicate when requests are allowed again */
  private static blockedUntil = 0
  /** to prevent the burst timer from being started twice */
  private static burstStarted = false

  public static queueRequest(req: AxiosRequestConfig): Promise<void> {
    let resolver: ResolveFunction
    const promise = new Promise<void>(res => (resolver = res))
    this.queue.push([ req, resolver ])
    return promise
  }

  private static burst(req: AxiosRequestConfig): Promise<void> {
    return axios(req)
      .catch(err => err?.response ?? { status: 999 })
      .then(res => Upstream.handleResponse(res, req))
  }

  private static handleResponse(res: AxiosResponse, retryConfig: AxiosRequestConfig): Promise<void> {
    const status = res?.status ?? 998
    Metrics.counterUpstreamStatus.inc({ status })

    if (status >= 400 && status < 600) {
      // TODO (low) if 404 remove the webhook from the db perhaps

      const rateLimit = Upstream.parseRateLimitRetry(res)
      if (rateLimit) {
        const localBlockedUntil = Date.now() + rateLimit
        if (localBlockedUntil > this.blockedUntil)
          this.blockedUntil = localBlockedUntil
        
        return Upstream.queueRequest(retryConfig)
      }
    }

    return Promise.resolve()
  }

  private static parseRateLimitRetry(res: AxiosResponse) {
    if (!res?.headers) return 0

    if (res.headers['x-ratelimit-remaining'] !== '0') return 0
    if (!res.headers['x-ratelimit-reset-after']) return 0

    return ~~(Number(res.headers['x-ratelimit-reset-after']) * 1000)
  }

  public static startBurstInterval() {
    if (Upstream.burstStarted) return
    Upstream.burstStarted = true
    const interval = ~~(config.behavior.upstreamRequestInterval / config.behavior.upstreamRequestRate)

    setInterval(() => {
      // Logger.debug(`Upstream burst. Prev remain: ${Upstream.remaining}`)
      if (!this.queue.length) return
      const task = this.queue.pop()
      Upstream.burst(task[0]).then(task[1])
    }, interval)
  }

}
