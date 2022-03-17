import { LanguageDataType, Localisation, Logger } from '@freestuffbot/common'
import RabbitHole from '@freestuffbot/rabbit-hole'
import { config } from '.'
import Mongo from './database/mongo'
import TaskRouter from './tasks/router'


export default class Modules {

  public static connectMongo(): Promise<any> {
    return Mongo.connect(config.mongoUrl)
  }

  public static async initRabbit(): Promise<void> {
    await RabbitHole.open(config.rabbitUrl)
    await RabbitHole.subscribe('DISCORD', TaskRouter.consume)
  }

  /** @returns boolean Whether successful */
  public static async loadLanguageFiles(): Promise<boolean> {
    const lang: LanguageDataType[] = await Mongo.Language
      .find({
        _index: { $gte: 0 },
        _enabled: true
      })
      .lean(true)
      .exec()
      .catch(() => {}) as any[]

    if (!lang?.length) {
      Logger.warn(`Loading language files failed.`)
      return false
    }

    Localisation.load(lang)
    Logger.process('Language files loaded')
    return true
  }

}
