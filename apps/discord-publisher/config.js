const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  mongoUrl: loadArg('DISCORD_PUBLISHER_MONGO_URL'),
  rabbitUrl: loadArg('DISCORD_PUBLISHER_RABBIT_URL'),
  behavior: {
    upstreamRequestRate: 40,
    publishSplitTaskAmount: 20
  },
  freestuffApi: {
    /** base api NOT INCLUDING version indicator */
    baseUrl: loadArg('DISCORD_PUBLISHER_FREESTUFF_API_URL'),
    /** this needs a privileged partner api key */
    auth: loadArg('DISCORD_PUBLISHER_FREESTUFF_API_KEY')
  }
}
