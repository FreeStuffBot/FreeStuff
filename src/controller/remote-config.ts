import { config } from '..'
import Logger from '../lib/logger'


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

  public static get excessiveLogging(): number {
    return this.get().excessive_logging ?? false
  }

  public static get botAdmins(): string[] {
    return this.get().bot_admins ?? config.admins ?? []
  }

  public static get botPlaytext(): string {
    return this.get().bot_playtext ?? '/free'
  }

}
