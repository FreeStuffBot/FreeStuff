const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  port: loadArg('DISCORD_INTERACTIONS_PORT'),
  discordClientId: loadArg('DISCORD_INTERACTIONS_CLIENTID'),
  discordPublicKey: loadArg('DISCORD_INTERACTIONS_PUBKEY'),
  mongoUrl: loadArg('DISCORD_INTERACTIONS_MONGO_URL'),
  discordGuildCacheInterval: 60_000,
  discordChannelsCacheInterval: 60_000,
  discordWebhooksCacheInterval: 60_000,
  dataGuildCacheInterval: 20_000,
  userLimits: {
    refreshChannelsInterval: 10_000,
    refreshRolesInterval: 10_000,
  },
  network: {
    discordGateway: loadArg('NETWORK_DISCORD_GATEWAY')
  }
}
