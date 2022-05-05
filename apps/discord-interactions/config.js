const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  port: loadArg('DISCORD_INTERACTIONS_PORT') || 80,
  discordClientId: loadArg('DISCORD_INTERACTIONS_CLIENTID'),
  discordPublicKey: loadArg('DISCORD_INTERACTIONS_PUBKEY'),
  mongoUrl: loadArg('DISCORD_INTERACTIONS_MONGO_URL'),
  rabbitUrl: loadArg('DISCORD_INTERACTIONS_RABBIT_URL'),
  discordGuildCacheInterval: 60_000,
  discordChannelsCacheInterval: 60_000,
  discordWebhooksCacheInterval: 60_000,
  dataGuildCacheInterval: 20_000,
  userLimits: {
    refreshChannelsInterval: 10_000,
    refreshRolesInterval: 10_000,
  },
  network: {
    umiAllowedIpRange: loadArg('NETWORK_UMI_ALLOWED_IP_RANGE'),
    discordGateway: loadArg('NETWORK_DISCORD_GATEWAY')
  },
  freestuffApi: {
    baseUrl: loadArg('DISCORD_INTERACTIONS_FREESTUFF_API_URL'),
    auth: loadArg('DISCORD_INTERACTIONS_FREESTUFF_API_KEY')
  }
}
