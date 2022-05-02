import { Logger } from "@freestuffbot/common"
import { config } from "."
import * as express from 'express'
import Mongo from "./database/mongo"
// import DockerInterface from "./lib/docker-interface"


export default class Modules {

  public static connectMongo(): Promise<any> {
    return Mongo.connect(config.mongoUrl)
  }

  public static initDocker() {
    // DockerInterface.connect()
  }

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    // app.get('/analytics', getAnalytics)

    app.all('*', (_, res) => res.status(400).end())

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

}
