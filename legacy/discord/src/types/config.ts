import { FreeStuffApiSettings } from 'freestuff'


type botMode = {
  name: 'single'
} | {
  name: 'shard'
  shardIds: number[]
  shardCount: number
} | {
  name: 'worker'
  master: {
    host?: string
    path?: string
    auth?: string
  }
}


/**
 * The typing of the `config.js` file.
 */
export type configjs = {
  bot: {
    token: string
    mode: 'dev' | 'beta' | 'regular'
    clientId: string
  }
  mode: botMode
  mongoDB: {
    url: string
    dbName: string
  }
  redis?: any
  thirdParty?: {
    sentry?: {
      dsn: string
    }
  }
  apiSettings: FreeStuffApiSettings
  server: {
    enable: boolean
    port: number
    endpoints: {
      /** The endpoint to serve the webhook on, defaults to `/webhook`. */
     apiWebhook?: string | true
     /** The endpoint to serve metrics on, defaults to `/webhook`. */
     metrics?: string | true
    }
  }
  supportWebhook?: {
    id: string
    token: string
  }
  admins?: string[]
}
