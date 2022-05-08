import { Logger, UmiLibs } from "@freestuffbot/common"
import { config } from "."
import * as express from 'express'
import { getChannels } from "./router/channels"
import { getGuild } from "./router/guild"
import { getMember } from "./router/member"
import { getWebhook, getWebhooks, postWebhook } from "./router/webhooks"
import Metrics from "./lib/metrics"


export default class Modules {

  public static async initMetrics(): Promise<void> {
    Metrics.init()
  }

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.get('/channels/:guild', getChannels)
    app.get('/guild/:guild', getGuild)
    app.get('/member/:guild', getMember)
    app.get('/webhooks/:channel', getWebhooks)
    app.get('/webhooks/:hookid/:hooktoken', getWebhook)
    app.post('/webhooks/:channel', postWebhook)

    app.all('/umi/*', UmiLibs.ipLockMiddleware(config.network.umiAllowedIpRange))
    app.get('/umi/metrics', Metrics.endpoint())

    app.all('*', (_, res) => res.status(400).end())

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

}
