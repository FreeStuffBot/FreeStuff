import * as mongo from 'mongodb';
import MongoAdapter from './mongo-adapter';


export type dbcollection = 'guilds' | 'stats-usage' | 'games' | 'stats-top-clients';

export default class Database {

  public static client: mongo.MongoClient;

  //

  public constructor() { }

  //

  public static init() {
    Database.client = MongoAdapter.client;
  }

  public static get(name: string): mongo.Db | null {
    return this.client ? this.client.db(name) : null;
  }

  public static collection(collection: dbcollection): mongo.Collection | null {
    return this.client ? this.client.db('freestuffbot').collection(collection) : null;
  }

}