const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  port: loadArg('API_PORT') || 80,
  redis: loadArg('API_REDIS_URL'),
  mongoUrl: loadArg('API_MONGO_URL'),
  rabbitUrl: loadArg('API_RABBIT_URL'),
  dashboardCorsOrigin: loadArg('API_DASH_CORS_ORIGIN'),
  dashboardOauthCallbackUrl: loadArg('API_DASH_OAUTH_CALLBACK_URL'),
  behavior: {
    desiredGuildCountPerBucket: 250,
    resolvingCacheMaxAge: 1000 * 60 * 5,
    currconvUpdateInterval: 1000 * 60 * 60 * 24
  },
  keys: {
    privateKeyUri: loadArg('API_PRIVATE_KEY_URI')
  },
  oauth: {
    discord: {
      appId: loadArg('API_OAUTH_DISCORD_APPID'),
      appSecret: loadArg('API_OAUTH_DISCORD_APPSECRET')
    }
  },
  thirdparty: {
    gibu: {
      gqlUri: loadArg('NETWORK_GIBU_GQL_ENDPOINT')
    }
  },
  network: {
    thumbnailer: loadArg('NETWORK_THUMBNAILER'),
    linkProxy: loadArg('NETWORK_LINK_PROXY')
  }
}
