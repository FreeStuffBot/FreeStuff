import * as chalk from 'chalk'
import mongoose from 'mongoose'
import appModel from 


export default class Mongo {

  public static connection: mongoose.Connection;

  public static User = mongoose.model('App', appModel)

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
