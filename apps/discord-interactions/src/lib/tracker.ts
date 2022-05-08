import { Errors, Fragile, SanitizedGuildType, Tracking } from '@freestuffbot/common'
import { GuildData as GuildDataPending } from 'cordo'
import DatabaseGateway from '../services/database-gateway'


export type GuildDataResolveable = SanitizedGuildType | Promise<SanitizedGuildType> | GuildDataPending

export default class Tracker {

  public static readonly TRACKING_POINT = Tracking.DISCORD_POINTS

  private static resolveGuildData(g: GuildDataResolveable): Promise<Fragile<Readonly<SanitizedGuildType>>> {
    if ((g as SanitizedGuildType).tracker)
      return Promise.resolve([ null, g as SanitizedGuildType ])

    if ((g as GuildDataPending).fetch)
      return (g as GuildDataPending).fetch()

    if ((g as Promise<SanitizedGuildType>).then) {
      return new Promise((res) => {
        (g as Promise<SanitizedGuildType>)
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

  public static syncShowHint(guild: SanitizedGuildType, hint: keyof typeof Tracker.TRACKING_POINT): boolean {
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

  public static syncIsTracked(g: SanitizedGuildType, hint: keyof typeof Tracker.TRACKING_POINT): boolean {
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

  public static syncSet(g: SanitizedGuildType, hint: keyof typeof Tracker.TRACKING_POINT, value = true): void {
    if (!g) return
    const state = this.syncIsTracked(g, hint)
    if (state === value) return // no change
    DatabaseGateway.pushGuildDataChange(g.id.toString(), 'tracker', g.tracker ^ Tracker.TRACKING_POINT[hint])
  }

}
