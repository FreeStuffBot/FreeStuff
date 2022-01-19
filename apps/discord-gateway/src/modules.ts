import { Logger } from "@freestuffbot/common"
import { config } from "."
import * as express from 'express'
import { getChannels } from "./router/channels"
import { getGuild } from "./router/guild"
import { getMember } from "./router/member"
import { getWebhooks, postWebhook } from "./router/webhooks"


export default class Modules {

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.get('/channels/:guild', getChannels)
    app.get('/guild/:guild', getGuild)
    app.get('/member/:guild', getMember)
    app.get('/webhooks/:channel', getWebhooks)
    app.post('/webhooks/:channel', postWebhook)

    app.all('*', (_, res) => res.status(400).end())

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

}
