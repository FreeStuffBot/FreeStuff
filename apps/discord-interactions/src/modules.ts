import { UmiLibs, ApiInterface, CMS, Errors, Localisation, Logger, ProductDiscountTypeArray, ProductDiscountTypeType } from "@freestuffbot/common"
import RabbitHole from '@freestuffbot/rabbit-hole'
import Cordo, { GuildData } from "cordo"
import { config } from "."
import * as express from 'express'
import DatabaseGateway from "./services/database-gateway"
import Mongo from "./services/mongo"
import FreestuffGateway from "./services/freestuff-gateway"
import Metrics from "./lib/metrics"


export default class Modules {

  public static async initRabbit(): Promise<void> {
    await RabbitHole.open(config.rabbitUrl)
  }

  public static async initApiInterface(): Promise<void> {
    ApiInterface.storeCredentials(
      config.freestuffApi.baseUrl,
      config.freestuffApi.auth
    )
  }

  public static async initMetrics(): Promise<void> {
    Metrics.init()
    Errors.createErrorHandler(h => Metrics.counterDiErrors.inc({
      errorid: h.status,
      source: h.source
    }))
  }

  public static async loadCmsData(retryDelay = 1000): Promise<void> {
    const success = await CMS.loadAll()
    if (success) {
      Logger.process('CMS data loaded.')
      return
    }

    Logger.warn('Loading data from CMS failed. Retrying soon.')
    await new Promise(res => setTimeout(res, retryDelay))

    if (retryDelay > 1000 * 60 * 2) {
      Logger.error('CMS data retry delay reached two minutes. Restarting.')
      process.exit(-1)
    }

    await Modules.loadCmsData(retryDelay * 2)
  }

  public static async loadProductChannnels() {
    for (const channel of ProductDiscountTypeArray)
      FreestuffGateway.updateChannel(channel as ProductDiscountTypeType)
  }

  public static initCordo() {
    Cordo.init({
      botId: config.discordClientId,
      contextPath: [ __dirname, 'interactions' ],
      // TODO(high) remote config
      // botAdmins: (id: string) => RemoteConfig.botAdmins.includes(id),
      // maybe we don't need to defer every time... hmmm...
      // immediateDefer: (_) => true,
      texts: {
        interaction_not_owned_title: '=interaction_not_owned_1',
        interaction_not_owned_description: '=interaction_not_owned_2',
        interaction_not_permitted_title: '=interaction_not_permitted_1',
        interaction_not_permitted_description_generic: '=interaction_not_permitted_2_generic',
        interaction_not_permitted_description_bot_admin: '=interaction_not_permitted_2_bot_admin',
        interaction_not_permitted_description_guild_admin: '=interaction_not_permitted_2_admin',
        interaction_not_permitted_description_manage_server: '=interaction_not_permitted_2_manage_server',
        interaction_not_permitted_description_manage_messages: '=interaction_not_permitted_2_manage_messages',
        interaction_failed: 'We are very sorry but an error occured while processing your command. Please try again.',
        interaction_invalid_description: 'Huh',
        interaction_invalid_title: 'That is odd. You should not be able to run this command...'
      }
    })
    Cordo.addMiddlewareInteractionCallback((data, i) => Localisation.translateObject(data, i, data._context, 14))
    Cordo.setMiddlewareGuildData(async (guildid) => {
      const out = { _cache: null } as Partial<GuildData>

      out.changeSetting = (key, value) => {
        DatabaseGateway.pushGuildDataChange(guildid, key, value)
      }

      out.fetch = async () => {
        if (out._cache) return out._cache
        const item = await DatabaseGateway.getGuild(guildid)
        out._cache = item
        return item
      }

      return out as GuildData
    })
    // Cordo.setMiddlewareApiResponseHandler(res => Metrics.counterApiResponses.labels({ status: res.status }).inc())
  }

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.post('/', Cordo.useWithExpress(config.discordPublicKey))

    app.all('/umi/*', UmiLibs.ipLockMiddleware(config.network.umiAllowedIpRange))
    app.get('/umi/metrics', Metrics.endpoint())

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

  public static connectDatabases(): Promise<any> {
    return Mongo.connect(config.mongoUrl)
  }

}
