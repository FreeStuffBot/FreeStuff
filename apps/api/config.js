const loadArg = require('config/load-arg')


module.exports = {
  port: loadArg('API_PORT'),
  redis: null
}
