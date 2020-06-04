const production = process.env.NODE_ENV === 'production';
const dev        = process.env.NODE_ENV === 'dev';
const debug      = process.env.NODE_ENV === 'debug';


module.exports = {
  bot: {
    token: "TOKEN"
  },
  mongodb: {
    url: "URL"
  },
  thirdparty: {
    topgg: {
      apitoken: "TOKEN"
    },
    sentry: {
      dsn: "URL"
    }
  },
  sharder: {
    auth: "TOKEN",
    url: production
      ? "https://dashboard.freestuffbot.xyz/api/shards"
      : "http://localhost/api/shards"
  },
  supportWebhook: {
    id: "123456789123456789",
    token: "abcdefghijklmnopqrstuvwxyz"
  },
  lang: "en",
  admins: [
    "137258778092503042"
  ]
}