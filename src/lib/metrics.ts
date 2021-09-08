import { Counter, Gauge, Registry } from 'prom-client'
import { Request, Response } from 'express'


export default class Metrics {

  private static register = new Registry()

  public static init() {
    // collectDefaultMetrics({ register: Metrics.register })

    // dummy counter, replace please
    const counterRequests = new Counter({
      name: 'thumbnailer_total_requests',
      help: 'Keeps track of the total amount of incoming requests',
      labelNames: [ 'gameid', 'tracker' ]
    })
    Metrics.register.registerMetric(counterRequests)

    // dummy gauge, replace please
    const gaugeCachedImages = new Gauge({
      name: 'thumbnailer_cached_images',
      help: 'Shows the current amount of cached images'
    })
    Metrics.register.registerMetric(gaugeCachedImages)
    gaugeCachedImages.reset()
  }

  public static endpoint() {
    return async function (_req: Request, res: Response) {
      res
        .status(200)
        .header({ 'Content-Type': 'text/plain' })
        .send(await Metrics.register.metrics())
    }
  }

}
