import * as redis from 'redis'


export type configjs = {
  port: number
  redis?: Omit<redis.RedisClientOptions<never, any>, "modules">
  mongoUrl: string
  rabbitUrl: string
  dashboardCorsOrigin: string
  dashboardOauthCallbackUrl: string
  auditLog: {
    destinationDiscord: string
  },
  notifications: {
    destinationDiscord: string
  },
  behavior: {
    desiredGuildCountPerBucket: number
    desiredAppCountPerBucket: number
  }
  routines: {
    fetchFreebies: string
    clearResolverCache: string
    updateCurrConvData: string
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
