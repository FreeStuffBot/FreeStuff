import { hostname } from 'os'
import * as Sentry from '@sentry/node'
import { config } from '../../index'
import Logger from '../../lib/logger'


export default class SentryManager {

  public static init() {
    if (config.bot.mode !== 'regular') {
      Logger.process('Skipping Sentry initialization. Reason: config.bot.mode != "regular"')
      return
    }

    if (!config.thirdParty?.sentry?.dsn) {
      Logger.process('Skipping Sentry initialization. Reason: no config found')
      return
    }

    Logger.process('Initializing Sentry ...')

    Sentry.init({
      dsn: config.thirdParty.sentry.dsn,
      serverName: hostname(),
      beforeSend: (event, hint) => {
        Logger.warn(hint.originalException?.toString() || hint.syntheticException.message)
        return event
      }
    })

    Logger.process('Sentry initialized')
  }

  public static report(exception: Sentry.Exception) {
    if (config.bot.mode !== 'regular') {
      Logger.error('=== SENTRY ERROR ===')
      // eslint-disable-next-line no-console
      console.trace(exception)
      Logger.error('====================')
    } else {
      Sentry.captureException(exception)
    }
  }

}
