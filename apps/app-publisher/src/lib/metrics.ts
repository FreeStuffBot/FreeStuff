import { Counter, Registry } from 'prom-client'
import { Request, Response } from 'express'


export default class Metrics {

  private static register = new Registry()

  public static counterUpstreamStatus = new Counter({
    name: 'fsb_sap_upstream_status',
    help: 'FreeStuffBot Service ApiPublisher: Upstream Response Status',
    labelNames: [ 'status' ]
  })

  //

  public static init() {
    Metrics.registerMetrics()
  }

  private static registerMetrics() {
    Metrics.register.registerMetric(Metrics.counterUpstreamStatus)
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
