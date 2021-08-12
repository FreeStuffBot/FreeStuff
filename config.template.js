/* eslint-disable @typescript-eslint/no-unused-vars */
/** DETAILED CONFIG TYPINGS CAN BE FOUND IN src/types/config.ts! */

const production = process.env.NODE_ENV === 'production'
const dev = process.env.NODE_ENV === 'dev'
const debug = process.env.NODE_ENV === 'debug'


module.exports = {
  bot: {
    token: 'TOKEN', // discord token
    mode: 'regular', // either "dev", "beta" or "regular". the latter is default.
    clientid: '123456789' // discord client id
  },
  mode: {
    name: 'single', // "single" = no sharding, "shard" = sharding, "worker" = auto-sharding
    master: { }, // [only if name = "discovery"] dictates the master node to assign this worker node. see type file for more info
    shardId: process.env.SHARD_ID || 0, // [only if name = "shard"] this shard id
    shardCount: process.env.SHARD_COUNT || 1 // [only if name = "shard"] total shard count
  },
  mongodb: {
    url: 'URL', // url (including auth) to your mongodb database
    dbname: 'freestuff' // name of the database used by the bot
  },
  apisettings: {
    key: 'loremipsumyourapitokenherehaveagreatday', // freestuff api key
    webhookSecret: 'mysecretsecret', // optional. webhook secret, can be removed if not using the webhook (or you don't want to use a secret (which you totally should))
    server: { // optional. if you want to start a server so you can receive webhook events
      enable: true, // enable the server
      port: 6622, // pick a port you like
      endpoint: '/webhook' // optional. remove this or change it to your own likings
    }
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
