const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  port: loadArg('APP_PUBLISHER_PORT') || 80,
  mongoUrl: loadArg('APP_PUBLISHER_MONGO_URL'),
  rabbitUrl: loadArg('APP_PUBLISHER_RABBIT_URL'),
  network: {
    umiAllowedIpRange: loadArg('NETWORK_UMI_ALLOWED_IP_RANGE')
  },
  behavior: {
    upstreamRequestRate: 45,
    upstreamRequestInterval: 1000,
    publishSplitTaskAmount: 20
  },
  freestuffApi: {
    /** base api NOT INCLUDING version indicator */
    baseUrl: loadArg('APP_PUBLISHER_FREESTUFF_API_URL'),
    /** this needs a privileged partner api key */
    auth: loadArg('APP_PUBLISHER_FREESTUFF_API_KEY')
  },
  upstreamProxy: {
    baseUrl: loadArg('APP_PUBLISHER_UPSTREAM_URL'),
    auth: loadArg('APP_PUBLISHER_UPSTREAM_AUTH')
  }
}
