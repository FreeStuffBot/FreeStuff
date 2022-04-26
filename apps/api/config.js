const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  port: loadArg('API_PORT'),
  redis: null,
  mongoUrl: loadArg('API_MONGO_URL'),
  rabbitUrl: loadArg('API_RABBIT_URL'),
  dashboardCorsOrigin: 'http://localhost:5522',
  dashboardOauthCallbackUrl: 'http://localhost:5522/oauth/callback',
  behavior: {
    desiredGuildCountPerBucket: 250,
    resolvingCacheMaxAge: 1000 * 60 * 5,
    currconvUpdateInterval: 1000 * 60 * 60 * 24
  },
  keys: {
    privateKeyUri: './vault/serverauth-private.key'
  },
  oauth: {
    discord: {
      appId: loadArg('API_OAUTH_DISCORD_APPID'),
      appSecret: loadArg('API_OAUTH_DISCORD_APPSECRET')
    }
  },
  thirdparty: {
    firebase: {
      key: loadArg('API_THIRDPARTY_FIREBASE_KEY')
    },
    gibu: {
      gqlUri: 'http://localhost:3030/graphql'
    }
  },
  network: {
    thumbnailer: loadArg('NETWORK_THUMBNAILER'),
    linkProxy: loadArg('NETWORK_LINK_PROXY')
  }
}
