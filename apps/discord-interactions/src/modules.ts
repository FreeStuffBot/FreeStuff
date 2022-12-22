import { UmiLibs, ApiInterface, CMS, Errors, Localisation, Logger, ProductDiscountTypeArray, ProductDiscountTypeType, FSApiGateway } from "@freestuffbot/common"
import RabbitHole from '@freestuffbot/rabbit-hole'
import Cordo, { GuildData } from "cordo"
import * as express from 'express'
import DatabaseGateway from "./services/database-gateway"
import Mongo from "./services/mongo"
import Metrics from "./lib/metrics"
import { config } from "."


export default class Modules {

  public static async initRabbit(): Promise<void> {
    Logger.info('Opening RabbitHole...')
    await RabbitHole.open(config.rabbitUrl)
    Logger.process('RabbitHole opened')
  }

  public static initApiInterface(): void {
    ApiInterface.storeCredentials(
      config.freestuffApi.baseUrl,
      config.freestuffApi.auth
    )
  }

  public static initMetrics(): void {
    Metrics.init()
    Errors.createErrorHandler(h => Metrics.counterDiErrors.inc({
      errorid: h.status,
      source: h.source
    }))
  }

  public static loadProductChannnels(retryUntilSuccessful = true) {
    for (const channel of ProductDiscountTypeArray)
      Modules.loadProductChannnel(channel as ProductDiscountTypeType, retryUntilSuccessful)
  }

  public static async loadProductChannnel(channel: ProductDiscountTypeType, retryUntilSuccessful: boolean) {
    const success = await FSApiGateway.updateChannel(channel)
    if (success || !retryUntilSuccessful) return
    // retry after 5 seconds
    setTimeout(() => Modules.loadProductChannnel(channel, true), 5000)
  }

  public static initCordo() {
    Cordo.init({
      botId: config.discordClientId,
      contextPath: [ __dirname, 'interactions' ],
      botAdmins: (id: string) => !!CMS.remoteConfig[1]?.global?.botAdmins?.includes(id),
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
    Cordo.addMiddlewareInteractionCallback((_, i) => Metrics.counterInteractions.inc({ type: i.type, name: (i.data as any)?.name || (i.data as any)?.custom_id }))
    Cordo.addMiddlewareInteractionCallback((data, i) => Localisation.translateObject(data, i, data._context, 14))
    Cordo.setMiddlewareGuildData((guildid) => {
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
    // not needed because we dont send out any api requests, we just respond to incoming webhooks
    // Cordo.setMiddlewareApiResponseHandler(res => Metrics.counterApiResponses.labels({ status: res.status }).inc())
  }

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.post('/', Cordo.useWithExpress(config.discordPublicKey))

    Modules.enableUmi(app)

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

  public static enableUmi(server: express.Express) {
    UmiLibs.mount(server, {
      allowedIpRange: config.network.umiAllowedIpRange,
      renderMetrics: Metrics.endpoint(),
      fetch: {
        cmsConstants: 1000 * 60 * 60 * 6, // every 6h
        languages: 1000 * 60 * 60 * 6, // every 6h
        experiments: 1000 * 60 * 60 * 6, // every 6h
        remoteConfig: 1000 * 60 * 60 * 6, // every 6h
      }
    })

    UmiLibs.registerCommand({
      name: 'test',
      description: 'This is a test command to test.',
      arguments: [
        {
          name: 'text',
          type: 'string',
          description: 'A text',
          array: false,
          enum: null
        },
        {
          name: 'text_list',
          type: 'string',
          description: 'Two text',
          array: true,
          enum: null
        },
        {
          name: 'one_emum',
          type: 'string',
          description: 'Three text',
          array: false,
          enum: [ 'gaming', 'not gaming' ]
        },
        {
          name: 'more_emum',
          type: 'string',
          description: 'Four text',
          array: true,
          enum: [ 'gaming', 'not gaming', 'three gaming' ]
        },
        {
          name: 'numbr',
          type: 'number',
          description: 'one or two or more',
          array: false,
          enum: null
        },
        {
          name: 'boooool',
          type: 'boolean',
          description: 'tru or fals',
          array: false,
          enum: null
        },
      ],
      handler(data: any): string {
        const dat = JSON.stringify(data) + ' xoxo'
        console.log(dat)
        return data.text === 'error' ? dat : ''
      }
    })
  }

  public static connectDatabases(): Promise<any> {
    return Mongo.connect(config.mongoUrl)
  }

  public static loadDevLangData(): void {
    setTimeout(() => {
      Localisation.load([
        {
          _id: 'en-US',
          subscription_free_name: '100% Discount',
          subscription_weekend_name: 'Free Weekend!',
          subscription_dlc_name: 'DLC\'s & More',
          subscription_prime_name: 'Prime Gaming',
          subscription_gamepass_name: 'Game Pass',
          settings_general: 'General Settings',
          subscriptions_notifications_add_role: 'Add Role',
        }
      ], true)
    }, 5000) // wait for umi libs to mount
  }

}
