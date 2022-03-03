import { Logger } from "@freestuffbot/common"
import { config } from "."
import * as express from 'express'
import DashRouter from "./routes/dash/_router"
import Mongo from './database/mongo'
import V1Router from "./routes/v1/_router"


export default class Modules {

  public static connectMongo(): Promise<any> {
    return Mongo.connect(config.mongoUrl)
  }

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.use('*', express.json())

    app.use('/dash', DashRouter.init())
    app.use('/v1', V1Router.init())
    // app.use('/internal', )

    app.all('*', (_, res) => res.status(400).end())

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

}
