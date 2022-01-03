const loadArg = require('config/load-arg')


module.exports = {
  port: loadArg('DISCORD_INTERACTIONS_PORT'),
  discordClientId: loadArg('DISCORD_INTERACTIONS_CLIENTID'),
  discordPublicKey: loadArg('DISCORD_INTERACTIONS_PUBKEY'),
  admins: [
    '137258778092503042'
  ]
}
