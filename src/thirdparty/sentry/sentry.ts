import * as Sentry from '@sentry/node';
import { Core, config } from '../../index';


export default class SentryManager {

  private constructor() { }

  public static init() {
    Sentry.init({ dsn: config.thirdparty.sentry.dsn });
  }

  public static report(exception: Sentry.Exception) {
    if (Core.devMode) {
      console.log('=== SENTRY ERROR ===');
      console.trace(exception);
      console.log('====================');
    } else {
      Sentry.captureException(exception);
    }
  }

}