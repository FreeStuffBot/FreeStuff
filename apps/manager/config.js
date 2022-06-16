const loadArg = require('@freestuffbot/config/load-arg')


/** @type {import('./src/types/config').configjs} */
module.exports = {
  port: loadArg('MANAGER_PORT') || 80,
  mongoUrl: loadArg('MANAGER_MONGO_URL'),
  dockerOptions: null,
  dockerNetworkPrefix: 'fsb',
  dockerLabels: {
    role: 'xyz.freestuffbot.service.role',
    network: 'xyz.freestuffbot.service.network'
  }
}
