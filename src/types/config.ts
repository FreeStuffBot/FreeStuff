import { FreeStuffApiSettings } from 'freestuff'


type botMode = {
  name: 'single'
} | {
  name: 'shard'
  shardId: number
  shardCount: number
} | {
  name: 'discovery'
  master: {
    host?: string
    path?: string
    auth?: string
  }
}

/**
 * The typing of the FreeStuff API webhook server configuration.
 *
 * The bot can provide a webhook which can be triggered by the FreeStuff API.
 */
export type FreeStuffApiServerConfig = {
  /**
   * Whether to enable the webhook or not.
   */
  enable: boolean
  /**
   * The port to run the webhook server on.
   */
  port: number
  /**
   * The endpoint to serve the webhook on, defaults to `/webhook`.
   */
  endpoint?: string
}

/**
 * The typing of the `config.js` file.
 */
export type configjs = {
  bot: {
    token: string
    mode: 'dev' | 'beta' | 'regular'
    clientid: string
  },
  mode: botMode
  mongodb: {
    url: string
    dbname: string
  },
  redis?: any,
  thirdparty?: {
    sentry?: {
      dsn: string
    }
  },
  apisettings: FreeStuffApiSettings & {
    server?: FreeStuffApiServerConfig
  }
  supportWebhook?: {
    id: string
    token: string
  },
  admins?: string[]
}
