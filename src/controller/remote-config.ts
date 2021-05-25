import Logger from '../util/logger'


export default class RemoteConfig {

  private static config: any = {}

  public static update(newConfig: any) {
    if (!newConfig) return
    Logger.info('Remote config updated')
    this.config = newConfig
  }

  public static get() {
    return this.config
  }

  //

  public static get announcementMessageDelay(): number {
    return this.get().announcement_message_delay || 2000
  }

}
