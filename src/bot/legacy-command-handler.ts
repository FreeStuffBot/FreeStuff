import { Const, Localisation } from '@freestuffbot/common'
import { Core } from '../index'
import FreeStuffBot from '../freestuffbot'
import Logger from '../lib/logger'
import Metrics from '../lib/metrics'
import DatabaseManager from './database-manager'


export default class LegacyCommandHandler {

  public readonly replacements: Map<string, string> = new Map()

  public constructor(bot: FreeStuffBot) {
    this.replacements.set('help', '/help')
    this.replacements.set('?', '/help')
    this.replacements.set('info', '/about')
    this.replacements.set('information', '/about')
    this.replacements.set('about', '/about')
    this.replacements.set('get', '/invite')
    this.replacements.set('link', '/invite')
    this.replacements.set('invite', '/invite')
    this.replacements.set('add', '/invite')
    this.replacements.set('join', '/invite')
    this.replacements.set('set', '/settings')
    this.replacements.set('settings', '/settings')
    this.replacements.set('setting', '/settings')
    this.replacements.set('config', '/settings')
    this.replacements.set('configure', '/settings')
    this.replacements.set('change', '/settings')
    this.replacements.set('test', '/settings → More → Send Test Message')
    this.replacements.set('vote', '/vote')
    this.replacements.set('topgg', '/vote')
    this.replacements.set('top', '/vote')
    this.replacements.set('botlist', '/vote')
    this.replacements.set('v', '/vote')
    this.replacements.set('check', '/settings')
    this.replacements.set('here', '/settings → More')
    this.replacements.set('free', '/free')
    this.replacements.set('currently', '/free')
    this.replacements.set('current', '/free')
    this.replacements.set('what', '/free')
    this.replacements.set('whats', '/free')
    this.replacements.set('what\'s', '/free')
    this.replacements.set('what´s', '/free')
    this.replacements.set('what`s', '/free')
    this.replacements.set('reset', '/settings → More → View Server Data → Delete Server Data')
    this.replacements.set('deletedata', '/settings → More → View Server Data → Delete Server Data')
    this.replacements.set('mydata', '/settings → More → View Server Data')
    this.replacements.set('advanced', '/settings → More')
    this.replacements.set('resend', '/settings → More → Re-send Messages')
    this.replacements.set('beta', '/settings → More → Beta')

    bot.on('messageCreate', async (m) => {
      if (m.author.bot) return
      if (!m.guild) return
      if (!m.content.replace('!', '').startsWith(bot.user.toString())
        && !m.content.toLowerCase().startsWith('@' + bot.user.username.toLowerCase())) return
      const self = await m.guild.members.fetch(Core.user)
      if (!self.permissionsIn(m.channelId).has('SEND_MESSAGES'))
        return

      if (!this.replacements.has(m.content.split(' ')?.[1]))
        return

      DatabaseManager.getGuildData(m.guild.id).then((g) => {
        const reply = (message: string, content: string, footer?: string, color?: number, image?: string) => {
          if (self.permissionsIn(m.channelId).has('EMBED_LINKS')) {
            m.channel.send({
              embeds: [
                {
                  color: color || 0x2F3136,
                  title: message,
                  description: content,
                  footer: {
                    text: `@${m.author.tag}` + (footer ? ` • ${footer}` : '')
                  },
                  image: {
                    url: image
                  }
                }
              ]
            })
          } else {
            m.channel.send(`**${message}**\n${content}`)
          }
        }

        const cmd = m.content.split(' ')[1]
        Metrics.counterLegacyCommands.labels({ name: cmd }).inc()
        const replaceWith = this.replacements.get(cmd)
        reply(
          Localisation.text(g, '=slash_command_introduction_info_short'),
          Localisation.text(g, '=slash_command_introduction_label_short', { command: replaceWith })
        )
      }).catch((err) => {
        Logger.excessive(err)
        try {
          /** no translaton in case the above failes due to language manager issues */
          m.reply(`An error occured! Please try again later. If this error persists, try removing the bot from your server and adding it back up. For additional support visit our support server: ${Const.links.supportInvite}`)
        } catch (ex) {}
      })
    })
  }

}
