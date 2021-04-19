import { hostname } from 'os'
import * as Sentry from '@sentry/node'
import { Core, config } from '../../index'


export default class SentryManager {

  public static init() {
    Sentry.init({
      dsn: config.thirdparty.sentry.dsn,
      serverName: hostname()
    })
  }

  public static report(exception: Sentry.Exception) {
    if (Core.devMode) {
      console.log('=== SENTRY ERROR ===')
      console.trace(exception)
      console.log('====================')
    } else {
      Sentry.captureException(exception)
    }
  }

}
