import { Counter, Gauge, Registry } from 'prom-client'
import { Request, Response } from 'express'
import RestCache from '../cache/rest-cache'


export default class Metrics {

  private static register = new Registry()

  public static counterDgRequests = new Counter({
    name: 'fsb_sdg_requests',
    help: 'FreeStuffBot Service DiscordGateway: Http Requests',
    labelNames: [ 'method', 'endpoint', 'status' ]
  })

  public static gaugeDgCacheSize = new Gauge({
    name: 'fsb_sdg_cache_size',
    help: 'Amount of items currently cached on this gateway. Updated every 10 seconds.',
    labelNames: [ 'bucket' ]
  })

  //

  public static init() {
    Metrics.registerMetrics()
    Metrics.startCollectors()
  }

  private static registerMetrics() {
    Metrics.register.registerMetric(Metrics.counterDgRequests)

    Metrics.register.registerMetric(Metrics.gaugeDgCacheSize)
  }

  private static startCollectors() {
    setInterval(() => {
      // Metrics.gaugeDgCacheSize.set({ bucket: 'channels' }, ChannelsCache.size)
      // Metrics.gaugeDgCacheSize.set({ bucket: 'guilds' }, GuildCache.size)
      // Metrics.gaugeDgCacheSize.set({ bucket: 'members' }, MemberCache.size)
      Metrics.gaugeDgCacheSize.set({ bucket: 'rest' }, RestCache.size)
    }, 10e3)
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
