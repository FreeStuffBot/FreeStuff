import { Logger } from "@freestuffbot/common"
import { config } from "."
import * as express from 'express'
import { getChannels } from "./router/channels"


export default class Modules {

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.get('/guilddata/:guild', getChannels)

    app.all('*', (_, res) => res.status(400).end())

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

}
