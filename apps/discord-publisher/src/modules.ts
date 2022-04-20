import { ApiInterface, CMS } from '@freestuffbot/common'
import RabbitHole from '@freestuffbot/rabbit-hole'
import { config } from '.'
import Mongo from './database/mongo'
import ApiGateway from './lib/api-gateway'
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

  public static async loadCmsData(): Promise<void> {
    CMS.loadAll()
  }

  public static async startUpstream(): Promise<void> {
    Upstream.startBurstInterval()
  }

  public static async initCacheJanitor(): Promise<void> {
    setInterval(() => ApiGateway.clearCaches(), 1000 * 60 * 60 * 24)
  }

}
