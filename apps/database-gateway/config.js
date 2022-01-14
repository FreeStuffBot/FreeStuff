const loadArg = require('config/load-arg')


const hours = x => x * 60 * 60 * 1000
const minutes = x => x * 60 * 1000
const seconds = x => x * 1000

module.exports = {
  port: loadArg('DATABASE_GATEWAY_PORT'),
  cacheTtlChannelsMin: seconds(10),
  cacheTtlChannelsMax: minutes(20)
}
