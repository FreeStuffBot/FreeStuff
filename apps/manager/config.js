const loadArg = require('@freestuffbot/config/load-arg')


/** @type {import('./src/types/config').configjs} */
module.exports = {
  port: loadArg('MANAGER_PORT'),
  mongoUrl: loadArg('MANAGER_MONGO_URL'),
  dockerOptions: null,
  dockerLabels: {
    role: 'xyz.freestuffbot.service.role',
    network: 'xyz.freestuffbot.service.network'
  }
}
