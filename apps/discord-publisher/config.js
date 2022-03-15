const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  mongoUrl: loadArg('DISCORD_PUBLISHER_MONGO_URL'),
  rabbitUrl: loadArg('DISCORD_PUBLISHER_RABBIT_URL'),
  behavior: {
    publishSplitTaskAmount: 20
  }
}
