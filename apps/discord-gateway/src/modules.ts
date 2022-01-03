import { Localisation, Logger } from "@freestuffbot/common"
import Cordo from "cordo"
import { config } from "."
import * as express from 'express'


export default class Modules {

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.use('/', Cordo.useWithExpress(config.discordPublicKey))

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

}
