import { Tracking } from '@freestuffbot/common'
import { GuildData } from '@freestuffbot/typings'


export default class Tracker {

  public static readonly TRACKING_POINT = Tracking.DISCORD_POINTS

  public static showHint(g: GuildData, hint: keyof typeof Tracker.TRACKING_POINT): boolean {
    return !this.isTracked(g, hint)
  }

  public static isTracked(g: GuildData, hint: keyof typeof Tracker.TRACKING_POINT): boolean {
    return g && (g.tracker & Tracker.TRACKING_POINT[hint]) !== 0
  }

  public static set(g: GuildData, hint: keyof typeof Tracker.TRACKING_POINT, value = true) {
    if (!g) return
    const state = this.isTracked(g, hint)
    if (state === value) return // no change
    // TODO
    // DatabaseManager?.changeSetting(g, 'tracker', g.tracker ^ Tracker.TRACKING_POINT[hint])
  }

}
