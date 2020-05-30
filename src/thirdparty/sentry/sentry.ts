import * as Sentry from '@sentry/node';
import { Core } from '../../index';
import * as chalk from 'chalk';


export default class SentryManager {

  private constructor() { }

  public static init() {
    Sentry.init({ dsn: 'https://52a6bf20c2994cd1a91481514a1918eb@o389356.ingest.sentry.io/5227454' });
  }

  public static report(exception: Sentry.Exception) {
    if (Core.devMode) {
      console.trace(exception);
    } else {
      Sentry.captureException(exception);
    }
  }

}