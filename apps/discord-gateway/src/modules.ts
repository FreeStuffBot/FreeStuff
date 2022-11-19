import { Logger, UmiLibs } from "@freestuffbot/common"
import * as express from 'express'
import { getChannels } from "./router/channels"
import { getGuild } from "./router/guild"
import { getMember } from "./router/member"
import { getWebhook, getWebhooks, postWebhook } from "./router/webhooks"
import Metrics from "./lib/metrics"
import RestCache from "./cache/rest-cache"
import { config } from "."


export default class Modules {

  public static initMetrics(): void {
    Metrics.init()
  }

  public static async startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.get('/channels/:guild', getChannels)
    app.get('/guild/:guild', getGuild)
    app.get('/member/:guild', getMember)
    app.get('/webhooks/:channel', getWebhooks)
    app.get('/webhooks/:hookid/:hooktoken', getWebhook)
    app.post('/webhooks/:channel', postWebhook)

    UmiLibs.mount(app, {
      allowedIpRange: config.network.umiAllowedIpRange,
      renderMetrics: Metrics.endpoint()
    })

    await new Promise(res => app.listen(config.port, undefined, res as any))
    Logger.process(`Server launched at port ${config.port}`)
  }

  public static startPurgeTask(): void {
    setInterval(() => {
      RestCache.purge()
    }, config.cachePurgeInterval)
  }

}
