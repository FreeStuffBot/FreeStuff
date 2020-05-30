import * as Sentry from '@sentry/node';


export default class SentryManager {

  private constructor() { }

  public static init() {
    Sentry.init({ dsn: 'https://52a6bf20c2994cd1a91481514a1918eb@o389356.ingest.sentry.io/5227454' });
  }

}