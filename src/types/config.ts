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


export type FreeStuffApiServerConfig = {
  enable: boolean
  port: number
  endpoint?: string
}


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
