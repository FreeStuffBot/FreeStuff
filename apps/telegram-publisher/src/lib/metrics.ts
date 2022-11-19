import { Counter, Registry } from 'prom-client'
import { Request, Response } from 'express'


export default class Metrics {

  private static register = new Registry()

  public static counterUpstreamStatus = new Counter({
    name: 'fsb_stp_upstream_status',
    help: 'FreeStuffBot Service TelegramPublisher: Upstream Response Status',
    labelNames: [ 'status' ],
    registers: [ this.register ],
  })

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
