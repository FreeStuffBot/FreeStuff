import { Errors, Fragile, SanitizedGuildType, Tracking } from '@freestuffbot/common'
import { GuildData as GuildDataPending } from 'cordo'
import DatabaseGateway from '../services/database-gateway'


export type GuildDataResolveable = SanitizedGuildType | Promise<SanitizedGuildType> | GuildDataPending

export default class Tracker {

  public static readonly TRACKING_POINT = Tracking.DISCORD_POINTS

  private static resolveGuildData(g: GuildDataResolveable): Promise<Fragile<Readonly<SanitizedGuildType>>> {
    if (!g)
      return Promise.resolve(Errors.throwStderrGeneric('discord-interactions::tracker.notpresent', 'Guild Data was not present', 'This error is likely caused by a bug. Please inform the bot team.'))

    if ((g as SanitizedGuildType).tracker !== undefined)
      return Promise.resolve([ null, g as SanitizedGuildType ])

    if ((g as GuildDataPending).fetch)
      return (g as GuildDataPending).fetch()

    if ((g as Promise<SanitizedGuildType>).then) {
      return new Promise((res) => {
        (g as Promise<SanitizedGuildType>)
          .then(d => res(Errors.success(d)))
          .catch(err => res(Errors.throwStderrGeneric('discord-interactions::tracker', err + '')))
      })
    }

    return Promise.resolve(Errors.throwStderrGeneric('discord-interactions::tracker.unresolveable', 'Guild Data was unresolveable', 'This error is likely caused by a bug. Please inform the bot team.'))
  }

  public static async showHint(guild: GuildDataResolveable, hint: keyof typeof Tracker.TRACKING_POINT): Promise<boolean> {
    if (!guild) return true
    const [ err, g ] = await Tracker.resolveGuildData(guild)
    if (err) {
      Errors.handleErrorWithoutCommunicate(err)
      return false
    }
    return Tracker.syncShowHint(g, hint)
  }

  public static syncShowHint(guild: SanitizedGuildType, hint: keyof typeof Tracker.TRACKING_POINT): boolean {
    if (!guild) return true
    return !Tracker.syncIsTracked(guild, hint)
  }

  public static async isTracked(guild: GuildDataResolveable, hint: keyof typeof Tracker.TRACKING_POINT): Promise<boolean> {
    if (!guild) return
    const [ err, g ] = await Tracker.resolveGuildData(guild)
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
    if (!guild) return
    const [ err, g ] = await Tracker.resolveGuildData(guild)
    if (err) {
      Errors.handleErrorWithoutCommunicate(err)
      return
    }
    return Tracker.syncSet(g, hint, value)
  }

  public static syncSet(g: SanitizedGuildType, hint: keyof typeof Tracker.TRACKING_POINT, value = true): void {
    if (!g) return
    const state = Tracker.syncIsTracked(g, hint)
    if (state === value) return // no change
    DatabaseGateway.pushGuildDataChange(g.id.toString(), 'tracker', g.tracker ^ Tracker.TRACKING_POINT[hint])
  }

}
