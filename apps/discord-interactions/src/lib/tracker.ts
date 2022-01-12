import { Fragile, Tracking } from '@freestuffbot/common'
import { GuildData } from '@freestuffbot/typings'
import { GuildData as GuildDataPending, GenericInteraction } from 'cordo'
import Errors from './errors'


export type GuildDataResolveable = GuildData | Promise<GuildData> | GuildDataPending

export default class Tracker {

  public static readonly TRACKING_POINT = Tracking.DISCORD_POINTS

  private static resolveGuildData(g: GuildDataResolveable): Promise<Fragile<Readonly<GuildData>>> {
    if ((g as GuildData).tracker)
      return Promise.resolve([ null, g as GuildData ])

    if ((g as GuildDataPending).fetch)
      return (g as GuildDataPending).fetch()

    if ((g as Promise<GuildData>).then) {
      return new Promise((res) => {
        (g as Promise<GuildData>)
          .then(d => res([ null, d ]))
          .catch(err => res(Errors.throwStderrGeneric('discord-interactions::tracker', err + '')))
      })
    }

    return Promise.resolve(null)
  }

  public static async showHint(guild: GuildDataResolveable, hint: keyof typeof Tracker.TRACKING_POINT): Promise<boolean> {
    const [ err, g ] = await this.resolveGuildData(guild)
    if (err) {
      Errors.handleErrorWithoutCommunicate(err)
      return false
    }
    return Tracker.syncShowHint(g, hint)
  }

  public static syncShowHint(guild: GuildData, hint: keyof typeof Tracker.TRACKING_POINT): boolean {
    return !this.syncIsTracked(guild, hint)
  }

  public static async isTracked(guild: GuildDataResolveable, hint: keyof typeof Tracker.TRACKING_POINT): Promise<boolean> {
    const [ err, g ] = await this.resolveGuildData(guild)
    if (err) {
      Errors.handleErrorWithoutCommunicate(err)
      return false
    }
    return Tracker.syncIsTracked(g, hint)
  }

  public static syncIsTracked(g: GuildData, hint: keyof typeof Tracker.TRACKING_POINT): boolean {
    return g && (g.tracker & Tracker.TRACKING_POINT[hint]) !== 0
  }

  public static async set(guild: GuildDataResolveable, hint: keyof typeof Tracker.TRACKING_POINT, value = true): Promise<void> {
    const [ err, g ] = await this.resolveGuildData(guild)
    if (err) {
      Errors.handleErrorWithoutCommunicate(err)
      return
    }
    return Tracker.syncSet(g, hint, value)
  }

  public static syncSet(g: GuildData, hint: keyof typeof Tracker.TRACKING_POINT, value = true): void {
    if (!g) return
    const state = this.syncIsTracked(g, hint)
    if (state === value) return // no change
    // TODO
    // DatabaseManager?.changeSetting(g, 'tracker', g.tracker ^ Tracker.TRACKING_POINT[hint])
  }

}
