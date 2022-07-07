const loadArg = require('@freestuffbot/config/load-arg')


/** @type {import('./src/types/config').configjs} */
module.exports = {
  port: loadArg('MANAGER_PORT') || 80,
  mongoUrl: loadArg('MANAGER_MONGO_URL'),
  network: {
    umiAllowedIpRange: loadArg('NETWORK_UMI_ALLOWED_IP_RANGE')
  },
  dockerOfflineMode: loadArg('DOCKER_OFFLINE_MODE') === 'true',
  dockerOptions: null,
  dockerManagerServiceName: 'fsb_manager',
  dockerLabels: {
    role: 'xyz.freestuffbot.service.role'
  },
  behavior: {
    networkRefetchInterval: 30000
  }
}
