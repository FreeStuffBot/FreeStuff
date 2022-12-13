import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { config } from ".."
import Metrics from "./metrics"


type RequestType = 'task_publish' | 'task_resend' | 'task_test'
type RequestConfig = AxiosRequestConfig & { $type: RequestType, $attempt: number }
type QueueEntry = RequestConfig

export default class Upstream {

  /** the outgoing queue */
  private static queue: QueueEntry[] = []
  /** to prevent the burst timer from being started twice */
  private static burstStarted = false
  /** outgoig requests are blocked while this number is > 0 */
  private static timeout = 0
  /** how many requests are currently sent but haven't received a reply */
  private static pendingReplyCount = 0

  public static queueRequest(req: RequestConfig): void {
    const tooManyRetries = req.$attempt > config.behavior.upstreamMaxRetries

    if (req.$attempt > 0)
      Metrics.counterUpstreamRetries.inc({ attempt: tooManyRetries ? 'dropped' : req.$attempt })

    if (tooManyRetries)
      return

    Upstream.queue.push(req)
  }

  /** time until the next free window */
  public static getTimeUntilWindowAvailable(): number {
    const intervalsQueued = Math.ceil(Upstream.queue.length / config.behavior.upstreamRequestRate)
    const waitFor = Math.max(0, intervalsQueued - 1)
    return waitFor * config.behavior.upstreamRequestInterval
  }

  /** sleep until the next free window */
  public static async waitUntilWindowAvailable(): Promise<void> {
    let sleepFor = Upstream.getTimeUntilWindowAvailable()
    // while loop becase if the queue didn't empty as quickly as predicted we'll have to wait some longer
    while (sleepFor > 0) {
      // wait for the predicted amount
      await new Promise(res => setTimeout(res, sleepFor))
      // check how we're doing
      sleepFor = Upstream.getTimeUntilWindowAvailable()
    }
  }

  //

  private static burst(req: RequestConfig): void {
    if (!req) return
    req.validateStatus = null
    Upstream.pendingReplyCount++
    axios(req)
      .catch(err => err?.response ?? { status: 999 })
      .then(res => Upstream.handleResponse(res, req))
  }

  private static async handleResponse(res: AxiosResponse, retryConfig: RequestConfig): Promise<void> {
    Upstream.pendingReplyCount--

    const status = res?.status ?? 998
    Metrics.counterUpstreamStatus.inc({ status })

    if (!res) return

    if (status === 429) {
      // rate limited
      const blockedFor = Upstream.parseRateLimitRetry(res) ?? 5000
      const scope = Upstream.parseRateLimitScope(res)

      Metrics.counterRateLimitHits.inc({ scope, type: retryConfig.$type })

      if (scope === 'shared') {
        const multiplier = retryConfig.$attempt ** 2
        await new Promise(res => setTimeout(res, blockedFor * multiplier))

        retryConfig.$attempt++
        Upstream.queueRequest(retryConfig)
        return
      }

      Upstream.timeout++
      await new Promise(res => setTimeout(res, blockedFor + 1))
      Upstream.timeout--

      retryConfig.$attempt++
      Upstream.queueRequest(retryConfig)
      return
    }

    if (status >= 500 && status < 600) {
      await Upstream.waitUntilWindowAvailable()

      retryConfig.$attempt++
      Upstream.queueRequest(retryConfig)
      return
    }

    if (status >= 400 && status < 500) {
      // TODO (low) if 404 remove the webhook from the db perhaps
    }
  }

  private static parseRateLimitScope(res: AxiosResponse): 'user' | 'global' | 'shared' {
    if (!res?.headers) return null
    return res.headers['x-ratelimit-scope'] as any
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

    setInterval(() => {
      // queue empty? return
      if (!Upstream.queue.length) return
      // rate limited? return
      if (Upstream.timeout) return
      // too many sent requests that didn't get a reply yet? return
      if (Upstream.pendingReplyCount > config.behavior.upstreamRequestRate) return

      const iterations = Math.min(Upstream.queue.length, config.behavior.upstreamRequestRate)
      for (let i = 0; i < iterations; i++)
        Upstream.burst(Upstream.queue.pop())
    }, config.behavior.upstreamRequestInterval)
  }

}
