import RabbitHole, { Task, TaskId, TaskIdsForQueue, TaskQueue, TasksForQueue } from '@freestuffbot/rabbit-hole'
import { config } from '.'
import Mongo from './database/mongo'
import TaskRouter from './tasks/router'


export default class Modules {

  public static connectMongo(): Promise<any> {
    return Mongo.connect(config.mongoUrl)
  }

  public static async initRabbit(): Promise<void> {
    await RabbitHole.open(config.rabbitUrl, TaskQueue.DISCORD)
    await RabbitHole.subscribe('DISCORD', TaskRouter.consume)
  }

}
