/* eslint-disable @typescript-eslint/no-unused-vars */

const production = process.env.NODE_ENV === 'production'
const dev = process.env.NODE_ENV === 'dev'
const debug = process.env.NODE_ENV === 'debug'


module.exports = {
  bot: {
    token: 'TOKEN', // discord token
    mode: 'regular', // either "beta" or "regular". the latter is default.
    clientid: '123456789' // discord client id
  },
  mode: {
    name: 'single', // "single" = no sharding, "shard" = sharding, "discovery" = auto-sharding
    master: 'api', // [only if name = "discovery"] dictates the master node to assign this worker node
    shardId: process.env.SHARD_ID || 0, // [only if name = "shard"] this shard id
    shardCount: process.env.SHARD_COUNT || 1 // [only if name = "shard"] total shard count
  },
  mongodb: {
    url: 'URL' // url (including auth) to your mongodb database
  },
  apisettings: {
    key: 'loremipsumyourapitokenherehaveagreatday' // freestuff api key
  },

  // EVERYTHING BELOW IS OPTIONAL AND CAN BE REMOVED

  redis: {
    // redis settings. can be left empty. https://www.npmjs.com/package/redis#options-object-properties
  },
  thirdparty: {
    sentry: {
      dsn: 'URL' // sentry dsn. can be found in sentry dashboard
    }
  },
  supportWebhook: {
    id: '123456789123456789', // "@freestuff here" webhook.
    token: 'abcdefghijklmnopqrstuvwxyz' // see above
  },
  admins: [
    '137258778092503042' // list of users allowed to use admin commands
  ]
}
