/* This config file is used to build the docker image */
/** DETAILED CONFIG TYPINGS CAN BE FOUND IN src/types/config.ts! */

const fs = require('fs')

function secret(name) {
  try {
    return fs.readFileSync('/run/secrets/' + name).toString()
  } catch (ex) {
    return process.env[name]
  }
}


module.exports = {
  bot: {
    token: secret('FSB_DBOT_TOKEN'),
    mode: 'regular',
    clientId: secret('FSB_DBOT_ID') || '672822334641537041'
  },
  mode: secret('FSB_MODE') === 'single'
    ? { name: 'single' }
    : secret('FSB_MODE') === 'shard'
      ? {
          name: 'shard',
          shardIds: secret('FSB_SHARD_IDS')?.split(',').map(parseInt) ?? [],
          shardCount: secret('FSB_SHARD_COUNT')
        }
      : {
          name: 'worker',
          master: { host: secret('FSB_WORKER_HOST') }
        },
  mongoDB: {
    url: secret('FSB_MONGO_URL'),
    dbName: 'freestuffbot'
  },
  apiSettings: {
    key: secret('FSB_FSAPI_KEY'),
    type: secret('FSB_FSAPI_TYPE') || 'partner',
    baseUrl: secret('FSB_FSAPI_HOST'),
    webhookSecret: secret('FSB_WEBHOOK_SECRET')
  },
  server: {
    enable: secret('FSB_SERVER_ENABLE') !== 'false',
    port: parseInt(secret('FSB_SERVER_PORT')),
    endpoints: {
      apiWebhook: secret('FSB_WEBHOOK_ENDPOINT') ?? false,
      metrics: secret('FSB_METRICS_ENDPOINT') ?? false
    }
  },
  redis: {
    host: secret('FSB_REDIS_HOST'),
    port: secret('FSB_REDIS_PORT') || 6379
  },
  thirdParty: {
    sentry: {
      dsn: secret('FSB_SENTRY_DSN')
    }
  }
}
