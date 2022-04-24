const loadArg = require('@freestuffbot/config/load-arg')


module.exports = {
  port: loadArg('THUMBNAILER_PORT'),
  discordToken: loadArg('THUMBNAILER_DISCORD_TOKEN'),
  discordCdnChannel: loadArg('THUMBNAILER_DISCORD_CDN_CHANNEL')
}
