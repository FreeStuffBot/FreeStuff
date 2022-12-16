import { Counter, Gauge, Registry } from 'prom-client'
import { Request, Response } from 'express'


export default class Metrics {

  private static register = new Registry()

  public static counterUpstreamStatus = new Counter({
    name: 'fsb_sdp_upstream_status',
    help: 'FreeStuffBot Service DiscordPublisher: Upstream Response Status',
    labelNames: [ 'status' ]
  })

  public static counterUpstreamRetries = new Counter({
    name: 'fsb_sdp_upstream_retries',
    help: 'FreeStuffBot Service DiscordPublisher: Upstream Retries',
    labelNames: [ 'attempt' ]
  })

  public static counterRateLimitHits = new Counter({
    name: 'fsb_sdp_rate_limit_hits',
    help: 'FreeStuffBot Service DiscordPublisher: Rate Limit Hits',
    labelNames: [ 'type', 'scope' ]
    // type = task type, scope = x-ratelimit headers
  })

  public static counterTasksConsumed = new Counter({
    name: 'fsb_sdp_tasks_consumed',
    help: 'FreeStuffBot Service DiscordPublisher: Tasks Consumed',
    labelNames: [ 'task', 'status' ]
  })

  public static counterGuildsCleared = new Counter({
    name: 'fsb_sdp_guilds_cleared',
    help: 'FreeStuffBot Service DiscordPublisher: Guilds Cleared',
    labelNames: [ ]
  })

  public static gaugeDebugQueueSize = new Gauge({
    name: 'fsb_sdp_debug_queue_size',
    help: 'FreeStuffBot Service DiscordPublisher: Debug Queue Size',
    labelNames: [ ]
  })

  public static gaugeDebugPendingReplies = new Gauge({
    name: 'fsb_sdp_debug_pending_replies',
    help: 'FreeStuffBot Service DiscordPublisher: Pending Replies',
    labelNames: [ ]
  })

  public static gaugeDebugTimeout = new Gauge({
    name: 'fsb_sdp_debug_timeout',
    help: 'FreeStuffBot Service DiscordPublisher: Upstream Timeout',
    labelNames: [ ]
  })

  public static gaugeDebugClientErrors = new Gauge({
    name: 'fsb_sdp_debug_client_errors',
    help: 'FreeStuffBot Service DiscordPublisher: Client Errors',
    labelNames: [ ]
  })

  //

  public static init() {
    Metrics.registerMetrics()
  }

  private static registerMetrics() {
    Metrics.register.registerMetric(Metrics.counterUpstreamStatus)
    Metrics.register.registerMetric(Metrics.counterUpstreamRetries)
    Metrics.register.registerMetric(Metrics.counterRateLimitHits)
    Metrics.register.registerMetric(Metrics.counterTasksConsumed)
    Metrics.register.registerMetric(Metrics.counterGuildsCleared)
    Metrics.register.registerMetric(Metrics.gaugeDebugQueueSize)
    Metrics.register.registerMetric(Metrics.gaugeDebugPendingReplies)
    Metrics.register.registerMetric(Metrics.gaugeDebugTimeout)
    Metrics.register.registerMetric(Metrics.gaugeDebugClientErrors)
  }

  //

  public static endpoint() {
    return async function (_req: Request, res: Response) {
      res
        .status(200)
        .header({ 'Content-Type': 'text/plain' })
        .send(await Metrics.register.metrics())
    }
  }

}
