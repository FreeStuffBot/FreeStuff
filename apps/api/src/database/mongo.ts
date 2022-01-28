import { AppSchema, LanguageSchema, UserSchema } from '@freestuffbot/common'
import * as chalk from 'chalk'
import * as mongoose from 'mongoose'


export default class Mongo {

  public static connection: mongoose.Connection;

  public static App = mongoose.model('App', AppSchema)
  public static User = mongoose.model('User', UserSchema)
  public static Language = mongoose.model('Language', LanguageSchema)

  //

  public static connect(url?: string): Promise<any> {
    console.info(chalk`{yellow ⏳Connecting to Mongo...}`)

    return new Promise<any>((resolve, reject) => {
      this.connection = mongoose.connection
      mongoose.connect(url)
      this.connection.on('error', reject)
      this.connection.on('open', () => {
        console.info(chalk`{green ✓ Mongo connection estabished}`)
        resolve(this.connection)
      })
    })
  }

  public static disconnect(): void {
    this.connection.close()
  }

}
