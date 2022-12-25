import { Logger, UmiLibs, UmiCommandSender } from "@freestuffbot/common"
import RabbitHole from "@freestuffbot/rabbit-hole"
import * as express from 'express'
import DashRouter from "./routes/dash/_router"
import Mongo from './database/mongo'
import V1Router from "./routes/v1/_router"
import GibuGqlCore from "./services/gibu/gibu-gql-core"
import V2Router from "./routes/v2/_router"
import InternalRouter from "./routes/internal/_router"
import Routines from "./routines/_routines"
import PublicRouter from "./routes/public/_router"
import { config } from "."


export default class Modules {

  public static umiSender: UmiCommandSender

  //

  public static async initRabbit(): Promise<void> {
    Logger.info('Opening RabbitHole...')
    await RabbitHole.open(config.rabbitUrl)
    Logger.process('RabbitHole opened')
  }

  public static connectMongo(): Promise<any> {
    return Mongo.connect(config.mongoUrl)
  }

  public static connectGibu() {
    GibuGqlCore.connect()
  }

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.use('*', express.json())

    app.use('/dash', DashRouter.init())
    app.use('/v1', V1Router.init())
    app.use('/v2', V2Router.init())
    app.use('/internal', InternalRouter.init())
    app.use('/public', PublicRouter.init())

    app.all('*', (_, res) => res.status(400).end())

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

  public static startRoutines() {
    Routines.start()
  }

  public static enableUmi() {
    Modules.umiSender = UmiLibs.registerCommandSender(config.network.manager)
  }

}
