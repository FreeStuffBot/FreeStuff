const loadArg = require('config/load-arg')


const hours = x => x * 60 * 60 * 1000
const minutes = x => x * 60 * 1000
const seconds = x => x * 1000

module.exports = {
  port: loadArg('DISCORD_GATEWAY_PORT'),
  apiToken: loadArg('DISCORD_GATEWAY_API_TOKEN'),
  apiUser: loadArg('DISCORD_GATEWAY_API_USER'),
  baseUrl: 'https://discord.com/api/v9',
  globalRateLimit: 50,
  cacheTtlChannelsMin: seconds(10),
  cacheTtlChannelsMax: minutes(20),
  cacheTtlGuildMin: seconds(10),
  cacheTtlGuildMax: minutes(10),
  cacheTtlMemberMin: seconds(10),
  cacheTtlMemberMax: minutes(20)
}
