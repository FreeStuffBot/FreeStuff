const loadArg = require('config/load-arg')


/** @type {import('./src/types/config').configjs} */
module.exports = {
  port: loadArg('LINK_PROXY_PORT'),
  mongoUrl: loadArg('LINK_PROXY_MONGO_URL'),
  firebase: {
    key: loadArg('LINK_PROXY_FIREBASE_API_KEY'),
    serviceAccount: loadArg('LINK_PROXY_FIREBASE_SERVICE_ACCOUNT_KEY')
  },
  metrics: {
    recordName: 'fsb_proxy_clicks',
    scrapeInterval: '1h'
  }
}
