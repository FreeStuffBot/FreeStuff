import { hostname } from 'os'
import * as chalk from 'chalk'
import * as Sentry from '@sentry/node'
import { Core, config } from '../../index'


export default class SentryManager {

  public static init(devMode: boolean) {
    if (devMode) {
      console.log(chalk.yellowBright('Skipping Sentry initialization. Reason: no config found'))
      return
    }

    if (!config.thirdparty?.sentry?.dsn) {
      console.log(chalk.yellowBright('Skipping Sentry initialization. Reason: devMode = true'))
      return
    }

    console.log(chalk.yellowBright('Initializing Sentry ...'))

    Sentry.init({
      dsn: config.thirdparty.sentry.dsn,
      serverName: hostname()
    })

    console.log(chalk.green('Sentry initialized'))
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
