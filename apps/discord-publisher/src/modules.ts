import { ApiInterface, CMS, Logger } from '@freestuffbot/common'
import RabbitHole from '@freestuffbot/rabbit-hole'
import { config } from '.'
import Mongo from './database/mongo'
import FreestuffGateway from './lib/freestuff-gateway'
import Upstream from './lib/upstream'
import TaskRouter from './tasks/router'


export default class Modules {

  public static connectMongo(): Promise<any> {
    return Mongo.connect(config.mongoUrl)
  }

  public static async initRabbit(): Promise<void> {
    await RabbitHole.open(config.rabbitUrl)
    await RabbitHole.subscribe('DISCORD', TaskRouter.consume)
  }

  public static async initApiInterface(): Promise<void> {
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

  public static async startUpstream(): Promise<void> {
    Upstream.startBurstInterval()
  }

  public static async initCacheJanitor(): Promise<void> {
    setInterval(() => FreestuffGateway.clearCaches(), 1000 * 60 * 60 * 24)
  }

}
