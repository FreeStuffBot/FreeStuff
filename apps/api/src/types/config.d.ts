import * as redis from 'redis'


export type configjs = {
  port: number
  redis?: Omit<redis.RedisClientOptions<never, any>, "modules">
  mongoUrl: string
  dashboardCorsOrigin: string
  dashboardOauthCallbackUrl: string
  keys: {
    privateKeyUri: string
  }
  oauth: {
    discord: {
      appId: string
      appSecret: string
    }
  }
  thirdparty: {
    currconv: {
      key: string
    }
    firebase: {
      key: string
    }
    gibu: {
      gqlUri: string
    }
  }
  network: {
    thumbnailer: string
  }
}
