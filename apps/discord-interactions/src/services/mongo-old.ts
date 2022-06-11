import { GuildDataType, LanguageDataType, Logger } from '@freestuffbot/common'
import * as mongo from 'mongodb'
import Metrics from '../lib/metrics'



export type Collection
  = 'language'
  | 'guilds'

type Query = mongo.Filter<mongo.Document>

export default class Mongo {

  public static client: mongo.MongoClient
  private static dbName: string

  //

  public static async connect(url: string): Promise<mongo.MongoClient> {
    Logger.info('Connecting to Mongo...')

    Mongo.dbName = url.split('?')[0].split('/').slice(-1)[0]
    Mongo.client = new mongo.MongoClient(url)

    await Mongo.client.connect()
    Logger.process('Mongo connection estabished')
    return Mongo.client
  }

  public static disconnect(): void {
    Mongo.client.close()
  }

  public static collection(name: Collection): mongo.Collection {
    return Mongo.client.db(Mongo.dbName).collection(name)
  }

  //

  public static async findById(collection: 'language', id: any): Promise<LanguageDataType>
  public static async findById(collection: 'guilds', id: any): Promise<GuildDataType>
  public static async findById(collection: Collection, id: any): Promise<any> {
    const data = await Mongo
      .collection(collection)
      .findOne({ _id: id })
      .catch(() => null)
    Metrics.counterDiDbReads.inc({ collection, success: data ? 1 : 0 })
    return data
  }

  public static async findMultiple(collection: 'language', query: Query): Promise<LanguageDataType[]>
  public static async findMultiple(collection: 'guilds', query: Query): Promise<GuildDataType[]>
  public static async findMultiple(collection: Collection, query: Query): Promise<any[]> {
    const data = await Mongo
      .collection(collection)
      .find(query)
      .toArray()
      .catch(() => null)
    Metrics.counterDiDbReads.inc({ collection })
    return data
  }

}
