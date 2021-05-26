import { collectDefaultMetrics, Counter, Gauge, Registry } from 'prom-client'


export default class Metrics {

  private static register = new Registry()

  public static init() {
    collectDefaultMetrics({ register: this.register })

    const counterRequests = new Counter({
      name: 'thumbnailer_total_requests',
      help: 'Keeps track of the total amount of incoming requests',
      labelNames: [ 'gameid', 'tracker' ]
    })
    this.register.registerMetric(counterRequests)

    const gaugeCachedImages = new Gauge({
      name: 'thumbnailer_cached_images',
      help: 'Shows the current amount of cached images'
    })
    this.register.registerMetric(gaugeCachedImages)
    gaugeCachedImages.reset()
  }

  public static async endpoint(_req, res) {
    res
      .status(200)
      .header({ 'Content-Type': 'text/plain' })
      .send(await this.register.metrics())
  }

}
