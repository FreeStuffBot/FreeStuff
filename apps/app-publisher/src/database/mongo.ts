import { AppSchema, Logger } from '@freestuffbot/common'
import * as mongoose from 'mongoose'


export default class Mongo {

  public static connection: mongoose.Connection;

  public static App = mongoose.model('App', AppSchema)

  //

  public static connect(url?: string): Promise<any> {
    Logger.info('Connecting to Mongo...')

    return new Promise<any>((resolve, reject) => {
      this.connection = mongoose.connection
      mongoose.connect(url)
      this.connection.on('error', reject)
      this.connection.on('open', () => {
        Logger.process('Mongo connection estabished')
        resolve(this.connection)
      })
    })
  }

  public static disconnect(): void {
    this.connection.close()
  }

}
