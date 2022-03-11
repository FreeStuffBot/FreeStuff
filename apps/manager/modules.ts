import { Logger } from "@freestuffbot/common"
import { config } from "."
import * as express from 'express'
import { getAnalytics } from "./router/analytics"
import { getMetrics } from "./router/metrics"
import Mongo from "./database/mongo"
import Metrics from "./lib/metrics"


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
    app.get('/metrics', getMetrics)

    app.all('*', (_, res) => res.status(400).end())

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

}
