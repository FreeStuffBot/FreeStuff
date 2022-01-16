const loadArg = require('config/load-arg')


module.exports = {
  port: loadArg('DISCORD_INTERACTIONS_PORT'),
  discordClientId: loadArg('DISCORD_INTERACTIONS_CLIENTID'),
  discordPublicKey: loadArg('DISCORD_INTERACTIONS_PUBKEY'),
  discordGuildCacheInterval: 60_000,
  discordChannelsCacheInterval: 60_000,
  network: {
    discordGateway: loadArg('NETWORK_DISCORD_GATEWAY')
  }
}
