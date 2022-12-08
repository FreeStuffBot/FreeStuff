const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  port: loadArg('API_PORT') || 80,
  redis: loadArg('API_REDIS_URL'),
  mongoUrl: loadArg('API_MONGO_URL'),
  rabbitUrl: loadArg('API_RABBIT_URL'),
  dashboardCorsOrigin: loadArg('API_DASH_CORS_ORIGIN'),
  dashboardOauthCallbackUrl: loadArg('API_DASH_OAUTH_CALLBACK_URL'),
  auditLog: {
    destinationDiscord: loadArg('API_AUDITLOG_DEST_DISCORD')
  },
  notifications: {
    destinationDiscord: loadArg('API_NOTIFICATIONS_DEST_DISCORD')
  },
  behavior: {
    desiredGuildCountPerBucket: 250,
    desiredAppCountPerBucket: 50
  },
  discordCommunity: {
    guildId: '517009303203479572',
    helperAuthToken: loadArg('API_DISCORD_HELPER_AUTH_TOKEN'),
    roles: {
      donor: '721776266755440690'
    }
  },
  routines: {
    // At minute 5 past every hour.
    fetchFreebies: '5 */1 * * *',
    // At every 5th minute.
    clearResolverCache: '*/5 * * * *',
    // At minute 10 past hour 2 and 14.
    updateCurrConvData: '10 2,14 * * *',
    // At 2:30 am
    cleanUpTranslations: '30 2 * * *'
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
    linkProxy: loadArg('NETWORK_LINK_PROXY'),
    manager: loadArg('NETWORK_MANAGER'),
  }
}
