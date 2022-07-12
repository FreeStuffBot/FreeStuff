import { Logger, UmiLibs } from "@freestuffbot/common"
import * as express from 'express'
import { getAnalytics } from "./router/analytics"
import { postCreateGame } from "./router/create"
import Mongo from "./database/mongo"
import Metrics from "./lib/metrics"
import { config } from "."


export default class Modules {

  public static connectMongo(): Promise<any> {
    return Mongo.connect(config.mongoUrl)
  }

  public static initMetrics() {
    Metrics.init()
  }

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.get('/analytics', getAnalytics)
    app.post('/create-game', express.json(), postCreateGame)

    UmiLibs.mount(app, {
      allowedIpRange: config.network.umiAllowedIpRange,
      renderMetrics: Metrics.endpoint()
    })

    app.all('*', (_, res) => res.status(400).end())

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

}
