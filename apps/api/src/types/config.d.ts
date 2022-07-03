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
    desiredAppCountPerBucket: number
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
    gibu: {
      gqlUri: string
    }
  }
  network: {
    thumbnailer: string
    linkProxy: string
    manager: string
  }
}
