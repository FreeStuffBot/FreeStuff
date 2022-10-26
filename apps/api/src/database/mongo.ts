import { AnnouncementSchema, AppSchema, CurrencySchema, ExperimentSchema, GuildSchema, LanguageSchema, Logger, MiscSchema, NotificationSchema, PlatformSchema, ProductSchema, TranslateApplicationSchema, TranslationSchema, UserSchema } from '@freestuffbot/common'
import * as mongoose from 'mongoose'


export default class Mongo {

  public static connection: mongoose.Connection;

  public static Announcement = mongoose.model('Announcement', AnnouncementSchema)
  public static App = mongoose.model('App', AppSchema)
  public static User = mongoose.model('User', UserSchema)
  public static Language = mongoose.model('Language', LanguageSchema)
  public static Product = mongoose.model('Product', ProductSchema)
  public static Platform = mongoose.model('Platform', PlatformSchema)
  public static Currency = mongoose.model('Currency', CurrencySchema)
  public static Experiment = mongoose.model('Experiment', ExperimentSchema)
  public static Misc = mongoose.model('Misc', MiscSchema)
  public static Guild = mongoose.model('Guild', GuildSchema)
  public static TranslateApplication = mongoose.model('TranslateApplication', TranslateApplicationSchema)
  public static Notification = mongoose.model('Notification', NotificationSchema)
  public static Translation = mongoose.model('Translation', TranslationSchema)

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
