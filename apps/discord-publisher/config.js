const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  port: Number(process.argv[2]) || loadArg('DISCORD_PUBLISHER_PORT') || 80,
  mongoUrl: loadArg('DISCORD_PUBLISHER_MONGO_URL'),
  rabbitUrl: loadArg('DISCORD_PUBLISHER_RABBIT_URL'),
  network: {
    umiAllowedIpRange: loadArg('NETWORK_UMI_ALLOWED_IP_RANGE')
  },
  behavior: {
    upstreamRequestRate: 5, // TODO up this to 10 once running stable
    upstreamRequestInterval: 250,
    upstreamMaxRetries: 10,
    upstreamMaxFramesInQueue: 2,
    upstreamClientErrorsTimeframeMinutes: 10,
    upstreamClientErrorsMax: 10000,
    upstreamClientErrorActionLeeway: 0.9,
    publishSplitTaskAmount: 20,
    publishTaskBatchSize: 5
  },
  freestuffApi: {
    /** base api NOT INCLUDING version indicator */
    baseUrl: loadArg('DISCORD_PUBLISHER_FREESTUFF_API_URL'),
    /** this needs a privileged partner api key */
    auth: loadArg('DISCORD_PUBLISHER_FREESTUFF_API_KEY')
  }
}
