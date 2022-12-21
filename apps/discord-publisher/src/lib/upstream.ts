import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { Long } from "bson"
import { config } from ".."
import Mongo from "../database/mongo"
import Metrics from "./metrics"


type RequestType = 'task_publish' | 'task_resend' | 'task_test'
type RequestConfig = AxiosRequestConfig & { $type: RequestType, $attempt: number, $guild: Long }
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
  /** number of 4xx errors received within the last x minutes */
  private static clientErrors = 0

  public static queueRequest(req: RequestConfig): void {
    const tooManyRetries = req.$attempt > config.behavior.upstreamMaxRetries

    if (req.$attempt > 0)
      Metrics.counterUpstreamRetries.inc({ attempt: tooManyRetries ? 'dropped' : req.$attempt })

    if (tooManyRetries)
      return

    Upstream.queue.push(req)
    Metrics.gaugeDebugQueueSize.set(Upstream.queue.length)
  }

  /** time until the next free window */
  public static getTimeUntilWindowAvailable(): number {
    const queueLength = Upstream.queue.length + Upstream.pendingReplyCount
    const intervalsQueued = Math.ceil(queueLength / config.behavior.upstreamRequestRate)
    const waitFor = Math.max(0, intervalsQueued - config.behavior.upstreamMaxFramesInQueue)
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
    Upstream.pendingReplyCount++
    Metrics.gaugeDebugPendingReplies.set(Upstream.pendingReplyCount)

    req.validateStatus = null
    axios(req)
      .catch(err => err?.response ?? { status: 999 })
      .then(res => Upstream.handleResponse(res, req))
      .catch(() => null)
      .then(() => {
        Upstream.pendingReplyCount--
        Metrics.gaugeDebugPendingReplies.set(Upstream.pendingReplyCount)
      })
  }

  private static async handleResponse(res: AxiosResponse, retryConfig: RequestConfig): Promise<void> {
    const status = res?.status ?? 998
    Metrics.counterUpstreamStatus.inc({ status })

    if (!res) return

    // rate limited
    if (status === 429) {
      // wait minimum of 1 second. if no limit was provided wait 30s
      const rawBlockedFor = Upstream.parseRateLimitRetry(res)
      const blockedFor = rawBlockedFor
        ? Math.max(1000, rawBlockedFor)
        : 60000
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
      Metrics.gaugeDebugTimeout.set(Upstream.timeout)
      await new Promise(res => setTimeout(res, blockedFor + 1))
      Upstream.timeout--
      Metrics.gaugeDebugTimeout.set(Upstream.timeout)

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
      Upstream.clientErrors++
      Metrics.gaugeDebugClientErrors.set(Upstream.clientErrors)
    }

    if (status === 404) {
      Upstream.clearGuild(retryConfig.$guild)
      return
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

    // START BURST
    setInterval(() => {
      // queue empty?
      if (!Upstream.queue.length) return
      // rate limited?
      if (Upstream.timeout) return
      // too many sent requests that didn't get a reply yet?
      if (Upstream.pendingReplyCount > config.behavior.upstreamMaxPendingReplyCount) return
      // too many client errors recently?
      if (Upstream.clientErrors >= (config.behavior.upstreamClientErrorsMax * config.behavior.upstreamClientErrorActionLeeway)) return

      const iterations = Math.min(Upstream.queue.length, config.behavior.upstreamRequestRate)
      for (let i = 0; i < iterations; i++) {
        Upstream.burst(Upstream.queue.shift())
        Metrics.gaugeDebugQueueSize.set(Upstream.queue.length)
      }
    }, config.behavior.upstreamRequestInterval)

    // START CLIENT ERROR DECAY
    setInterval(() => {
      if (!Upstream.clientErrors) return

      const sub = ~~(config.behavior.upstreamClientErrorsMax / config.behavior.upstreamClientErrorsTimeframeMinutes)
      if (Upstream.clientErrors <= sub)
        Upstream.clientErrors = 0
      else
        Upstream.clientErrors -= sub

      Metrics.gaugeDebugClientErrors.set(Upstream.clientErrors)
    }, 60000)
  }

  /** remove a guild's webhook from the database as it no longer exists */
  public static clearGuild(id: Long) {
    Mongo.Guild.updateOne(
      { _id: id },
      { $set: { webhook: null } },
      { lean: true }
    ).exec()
    Metrics.counterGuildsCleared.inc()
  }

}
