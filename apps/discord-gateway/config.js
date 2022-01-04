const loadArg = require('config/load-arg')


module.exports = {
  port: loadArg('DISCORD_GATEWAY_PORT'),
  apiToken: loadArg('DISCORD_GATEWAY_API_TOKEN'),
  baseUrl: 'https://discord.com/api/v9',
  globalRateLimit: 50,
  cacheTtlChannels: 1000 * 60
}
