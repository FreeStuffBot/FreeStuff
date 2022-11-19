const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  port: loadArg('TELEGRAM_PUBLISHER_PORT') || 80,
  rabbitUrl: loadArg('TELEGRAM_PUBLISHER_RABBIT_URL'),
  network: {
    umiAllowedIpRange: loadArg('NETWORK_UMI_ALLOWED_IP_RANGE')
  },
  freestuffApi: {
    /** base api NOT INCLUDING version indicator */
    baseUrl: loadArg('TELEGRAM_PUBLISHER_FREESTUFF_API_URL'),
    /** this needs a privileged partner api key */
    auth: loadArg('TELEGRAM_PUBLISHER_FREESTUFF_API_KEY')
  }
}
