import { ApiInterface, CMS, FSApiGateway, Logger, UmiLibs } from '@freestuffbot/common'
import RabbitHole from '@freestuffbot/rabbit-hole'
import * as express from 'express'
import Metrics from './lib/metrics'
import TaskRouter from './tasks/router'
import { config } from '.'


export default class Modules {

  public static async initRabbit(): Promise<void> {
    Logger.info('Opening RabbitHole...')
    await RabbitHole.open(config.rabbitUrl)
    await RabbitHole.subscribe('TELEGRAM', TaskRouter.consume)
    Logger.process('RabbitHole opened')
  }

  public static initApiInterface(): void {
    ApiInterface.storeCredentials(
      config.freestuffApi.baseUrl,
      config.freestuffApi.auth
    )
  }
  
  public static async loadCmsData(retryDelay = 1000): Promise<void> {
    const success = await CMS.loadAll()
    if (success) {
      Logger.process('CMS data loaded.')
      return
    }

    Logger.warn('Loading data from CMS failed. Retrying soon.')
    await new Promise(res => setTimeout(res, retryDelay))
    await Modules.loadCmsData(retryDelay * 2)
  }

  public static initCacheJanitor(): void {
    setInterval(() => FSApiGateway.clearOrRefetchAll(), 1000 * 60 * 60 * 24)
  }

  public static async startServer() {
    const app = express()
    app.set('trust proxy', 1)

    UmiLibs.mount(app, {
      allowedIpRange: config.network.umiAllowedIpRange,
      renderMetrics: Metrics.endpoint()
    })

    await new Promise(res => app.listen(config.port, undefined, res as any))
    Logger.process(`Server launched at port ${config.port}`)
  }

}
