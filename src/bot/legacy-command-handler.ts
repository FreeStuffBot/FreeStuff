import { Message } from 'discord.js'
import { Core, config } from '../index'
import FreeStuffBot from '../freestuffbot'
import { GuildData } from '../types/datastructs'
import { Command } from '../types/commands'
import Const from './const'
import HelpCommand from './legacycommands/help'
import InfoCommand from './legacycommands/info'
import InviteCommand from './legacycommands/invite'
import SettingsCommand from './legacycommands/settings'
import TestCommand from './legacycommands/test'
import VoteCommand from './legacycommands/vote'
import CheckCommand from './legacycommands/check'
import HereCommand from './legacycommands/here'
import FreeCommand from './legacycommands/free'
import ResetCommand from './legacycommands/reset'
import MydataCommand from './legacycommands/mydata'
import AdvancedCommand from './legacycommands/advanced'
import ResendCommand from './legacycommands/resend'
import BetaCommand from './legacycommands/beta'
import Localisation from './localisation'
import DatabaseManager from './database-manager'


export default class LegacyCommandHandler {

  public readonly commands: Command[] = []

  public constructor(bot: FreeStuffBot) {
    this.commands.push(new HelpCommand())
    this.commands.push(new InfoCommand())
    this.commands.push(new InviteCommand())
    this.commands.push(new SettingsCommand())
    this.commands.push(new TestCommand())
    this.commands.push(new VoteCommand())
    this.commands.push(new CheckCommand())
    this.commands.push(new HereCommand())
    this.commands.push(new FreeCommand())
    this.commands.push(new ResetCommand())
    this.commands.push(new MydataCommand())
    this.commands.push(new AdvancedCommand())
    this.commands.push(new ResendCommand())
    this.commands.push(new BetaCommand())

    bot.on('message', (m) => {
      if (m.author.bot) return
      if (!m.guild) return
      if (!m.content.replace('!', '').startsWith(bot.user.toString())
        && !m.content.toLowerCase().startsWith('@' + bot.user.username.toLowerCase())) return
      if (!m.guild.me.permissionsIn(m.channel).has('SEND_MESSAGES')) return

      const args = m.content.split(/ +/)
      args.splice(0, 1)
      DatabaseManager.getGuildData(m.guild.id).then((g) => {
        this.handleCommand(args.splice(0, 1)[0] || '', args, m, g).then((success) => {
          if (!success
            && m.guild.me.permissionsIn(m.channel).has('ADD_REACTIONS')
            && m.guild.me.permissionsIn(m.channel).has('READ_MESSAGE_HISTORY'))
            m.react('🤔')

        }).catch((_err) => { })
      }).catch((_err) => {
        try {
          /** no translaton in case the above failes due to language manager issues */
          m.reply(`An error occured! Please try again later. If this error persists, try removing the bot from your server and adding it back up. For additional support visit our support server: ${Const.links.supportInvite}`)
        } catch (ex) { }
      })
    })
  }

  // eslint-disable-next-line require-await
  public async handleCommand(command: string, args: string[], orgmes: Message, g: GuildData): Promise<boolean> {
    const reply = (message: string, content: string, footer?: string, color?: number, image?: string) => {
      if (orgmes.guild.me.permissionsIn(orgmes.channel).has('EMBED_LINKS')) {
        orgmes.channel.send({
          embed: {
            color: color || 0x2F3136,
            title: message,
            description: content,
            footer: {
              text: `@${orgmes.author.tag}` + (footer ? ` • ${footer}` : '')
            },
            image: {
              url: image
            }
          }
        })
      } else {
        orgmes.channel.send(`**${message}**\n${content}`)
      }
    }

    //

    if (command === '') {
      const langNotif = g.language.startsWith('en')
        ? (Localisation.getTranslationHint(orgmes.guild) && orgmes.member.hasPermission('MANAGE_GUILD'))
            ? '\n\n' + Localisation.getTranslationHint(orgmes.guild)
            : ''
        : '\n\n' + Core.text(g, '=cmd_freestuff_2_en', { website: Const.links.website })
      reply(
        Core.text(g, '=cmd_freestuff_1', { username: orgmes.author.username }),
        Core.text(g, '=cmd_freestuff_2', { website: Const.links.website }) + langNotif
      )
      return true
    }
    const egg = this.eastereggs([ command, ...args ].join(' '))
    if (egg !== '') {
      orgmes.channel.send(egg)
      return true
    }

    //

    const handler = this.commands.find(c => c.info.trigger.includes(command.toLowerCase()))
    if (!handler) {
      if (/set.*/.test(command.toLowerCase())) {
        reply(
          Core.text(g, '=cmd_missing_space_1', { command: command.toLowerCase().substr(3) }),
          Core.text(g, '=cmd_missing_space_2')
        )
        return true
      }
      return false
    }

    if (handler.info.serverManagerOnly) {
      if (!orgmes.member.hasPermission('MANAGE_GUILD') && !config.admins?.includes(orgmes.member.id)) {
        reply(
          Core.text(g, '=cmd_no_permission_1', { command: command.toLowerCase().substr(3) }),
          Core.text(g, '=cmd_no_permission_2'),
          undefined,
          undefined,
          'https://media.discordapp.net/attachments/672907465670787083/672907481957007400/unknown.png'
        )
        return true
      }
    }

    if (handler.info.adminOnly) {
      reply('Nope', 'Don\'t even try!') // TODO
      return true
    }

    const back = handler.handle(orgmes, args, g, reply)
    if (back === true) return true
    if (back === false) return false
    return (back as Promise<boolean>)
  }

  private eastereggs(command: string): string {
    switch (command.toLowerCase()) {
      case 'egg': return ':egg:'
      case 'what is 1 + 1': return '3'
      case 'do a barrel roll': return 'no'
      case 'why are you running?': return ':eyes:'
      case 'is gay': return 'no u'
      case 'sucks': return 'no u'
      case 'is bad': return 'no u'
      case 'is cool': return ':sunglasses:'
      case 'is awesome': return ':sunglasses:'
      case 'is amazing': return ':sunglasses:'
      case 'easteregg': return ':eyes:'
      case 'what is the meaning of life': return '42'
      case 'meaning of life': return '42'
      case 'maanex': return '<:yeehawmaanex:852836598110617651>'

      default: return ''
    }
  }

}
