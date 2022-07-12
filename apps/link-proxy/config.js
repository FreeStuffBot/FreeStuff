const loadArg = require('@freestuffbot/config/load-arg')


/** @type {import('./src/types/config').configjs} */
module.exports = {
  port: loadArg('LINK_PROXY_PORT') || 80,
  mongoUrl: loadArg('LINK_PROXY_MONGO_URL'),
  firebase: {
    key: loadArg('LINK_PROXY_FIREBASE_API_KEY'),
    serviceAccount: loadArg('LINK_PROXY_FIREBASE_SERVICE_ACCOUNT_KEY')
  },
  network: {
    umiAllowedIpRange: loadArg('NETWORK_UMI_ALLOWED_IP_RANGE')
  },
  metrics: {
    recordName: 'fsb_proxy_clicks',
    scrapeInterval: '1h'
  }
}
