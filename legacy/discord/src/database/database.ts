import * as mongo from 'mongodb'
import { config } from '../index'
import MongoAdapter from './mongo-adapter'


/**
 * The database collections for the freestuff bot.
 */
export type FreeStuffCollection = 'guilds' | 'stats-usage' | 'games' | 'stats-top-clients' | 'language'

export default class Database {

  public static client: mongo.MongoClient

  //

  public static init() {
    Database.client = MongoAdapter.client
  }

  public static get(name: string): mongo.Db | null {
    return this.client ? this.client.db(name) : null
  }

  public static collection(collection: FreeStuffCollection): mongo.Collection | null {
    return this.client ? this.client.db(config.mongoDB.dbName).collection(collection) : null
  }

}
