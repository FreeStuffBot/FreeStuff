/* This config file is used to build the docker image */
/** DETAILED CONFIG TYPINGS CAN BE FOUND IN src/types/config.ts! */

const fs = require('fs')

function secret(name) {
  try {
    return fs.readFileSync('/run/secret/' + name)
  } catch (ex) {
    return process.env[name]
  }
}


module.exports = {
  bot: {
    token: secret('FSB_DBOT_TOKEN'),
    mode: 'regular',
    clientid: secret('FSB_DBOT_ID') || '672822334641537041'
  },
  mode: {
    name: 'discovery',
    master: {
      host: process.env.NODE_ENV === 'production'
        ? undefined
        : 'ws://host.docker.internal'
    }
  },
  mongodb: {
    url: secret('FSB_MONGO_URL'),
    dbname: 'freestuffbot'
  },
  apisettings: {
    key: secret('FSB_FSAPI_KEY'),
    type: 'partner',
    baseUrl: process.env.NODE_ENV === 'production'
      ? undefined
      : 'http://host.docker.internal/api/v1'
  },
  thirdparty: {
    sentry: {
      dsn: secret('FSB_SENTRY_DSN')
    }
  },
  admins: [
    '137258778092503042',
    '171675309177831424'
  ]
}
