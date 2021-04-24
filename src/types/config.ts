import { FreeStuffApiSettings } from 'freestuff'


type botMode = {
  name: 'single'
} | {
  name: 'shard',
  shardId: number,
  shardCount: number
} | {
  name: 'discovery',
  master: 'api'
}


export type configjs = {
  bot: {
    token: string,
    mode: 'beta' | 'regular',
    clientid: string
  },
  mode: botMode,
  mongodb: {
    url: string,
    dbname: string
  },
  redis: any,
  thirdparty: {
    sentry: {
      dsn: string
    }
  },
  apisettings: FreeStuffApiSettings,
  supportWebhook?: {
    id: string,
    token: string
  },
  admins: string[]
}
