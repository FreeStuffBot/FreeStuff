const loadArg = require('config/load-arg')


module.exports = {
  port: loadArg('API_PORT'),
  redis: null,
  keys: {
    privateKeyUri: './vault/serverauth-private.key'
  },
  oauth: {
    discord: {
      appId: loadArg('API_OAUTH_DISCORD_APPID'),
      appSecret: loadArg('API_OAUTH_DISCORD_APPSECRET')
    }
  }
}
