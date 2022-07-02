import { Logger } from "@freestuffbot/common"
import * as express from 'express'
import Mongo from "./database/mongo"
import DockerInterface from "./lib/docker-interface"
import { getServicesComposed, getServicesRaw } from "./router/services"
import { postCommand } from "./router/command"
import { config } from "."


export default class Modules {

  public static connectMongo(): Promise<any> {
    return Mongo.connect(config.mongoUrl)
  }

  public static initDocker() {
    DockerInterface.connect()
  }

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.get('/services/raw', getServicesRaw)
    app.get('/services/composed', getServicesComposed)
    app.post('/services/command', express.json(), postCommand)

    app.all('*', (_, res) => res.status(400).end())

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

}
