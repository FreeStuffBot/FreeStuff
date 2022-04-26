import * as redis from 'redis'


export type configjs = {
  port: number
  redis?: Omit<redis.RedisClientOptions<never, any>, "modules">
  mongoUrl: string
  rabbitUrl: string
  dashboardCorsOrigin: string
  dashboardOauthCallbackUrl: string
  behavior: {
    desiredGuildCountPerBucket: number
    resolvingCacheMaxAge: number
    currconvUpdateInterval: number
  }
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
