import { ChannelSchema, CurrencySchema, GuildSchema, LanguageSchema, Logger, PlatformSchema, ProductSchema } from '@freestuffbot/common'
import * as mongoose from 'mongoose'


export default class Mongo {

  public static connection: mongoose.Connection;

  public static Guild = mongoose.model('Guild', GuildSchema)
  public static Product = mongoose.model('Product', ProductSchema)
  public static Currency = mongoose.model('Currency', CurrencySchema)
  public static Channel = mongoose.model('Channel', ChannelSchema)
  public static Platform = mongoose.model('Platform', PlatformSchema)
  public static Language = mongoose.model('Language', LanguageSchema)

  //

  public static connect(url?: string): Promise<mongoose.Connection> {
    Logger.info('Connecting to Mongo...')

    return new Promise<mongoose.Connection>((resolve, reject) => {
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
