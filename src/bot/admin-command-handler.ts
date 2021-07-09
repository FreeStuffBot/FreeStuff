import { hostname } from 'os'
import { Message } from 'discord.js'
import { Long } from 'mongodb'
import { Core, config } from '../index'
import FreeStuffBot from '../freestuffbot'
import Logger from '../lib/logger'
import Database from '../database/database'
import Experiments from '../controller/experiments'
import NewFreeCommand from './commands/free'

/*

THIS CLASS CLEARLY NEEDS SOME CLEANUP

but then again, it's probably gonna go deprecated soon as we roll out slash commands further

*/


const commandlist = [
  '`$FreeStuff help` - Shows this help page',
  '`$FreeStuff print` - Shows info about this guild',
  '`$FreeStuff settingbits` - ',
  '`$FreeStuff refetch` - ',
  '`$FreeStuff experiments [name]` - Prints all experiments or checks if current server participates in a certain experiment'
]

export default class AdminCommandHandler {

  public constructor(bot: FreeStuffBot) {
    bot.on('message', (m) => {
      if (m.author.bot) return
      if (!m.guild) return
      if (!m.content.toLowerCase().startsWith(config.bot.mode === 'regular' ? '$freestuff' : '$betastuff')) return
      if (!m.guild.me.permissionsIn(m.channel).has('SEND_MESSAGES')) return
      if (!config.admins?.includes(m.author.id)) return

      const args = m.content.split(' ')
      args.splice(0, 1)
      const success = this.handleCommand(args.splice(0, 1)[0] || '', args, m)
      if (!success
        && m.guild.me.permissionsIn(m.channel).has('ADD_REACTIONS')
        && m.guild.me.permissionsIn(m.channel).has('READ_MESSAGE_HISTORY'))
        m.react('🤔')
    })
  }

  public handleCommand(command: string, args: string[], orgmes: Message): boolean {
    const reply = (message: string, content: string, footer?: string, color?: number, image?: string) => {
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
    }

    switch (command.toLowerCase()) {
      case 'help':
        reply('Help is on the way!', 'Available commands:\n' + commandlist.map(c => `• ${c}`).join('\n'))
        return true

      case 'refetch':
        NewFreeCommand.updateCurrentFreebies()
        reply('ok', 'ok')
        return true

      case 'print':
        Database
          .collection('guilds')
          .findOne({ _id: Long.fromString(orgmes.guild.id) })
          .then(async (data) => {
            data._ = {
              responsibleShard: Core.options.shards[0],
              runningOnServer: await hostname()
            }
            orgmes.channel.send('```json\n' + JSON.stringify(data, null, 2) + '```')
          })
          .catch(Logger.error)
        return true

      case 'settingbits':
        Core.databaseManager.getRawGuildData(orgmes.guild.id).then((d) => {
          orgmes.channel.send([
            '```',
            '._______________._______.___._..',
            d.settings.toString(2).padStart(32, '0'),
            ' ╿        ┖──┬───┚┖─┬──┚╿╿╿╿┖┬─┚',
            ' H           G      F   EDCB A  ',
            '',
            'A) Theme  B) Currency  C) Reaction',
            'D) Trash Games  E) Alt Date Format',
            'F) Language  G) Stores H) Beta',
            '```'
          ].join('\n'))
        }).catch(orgmes.reply)
        return true

      case 'experiments':
        if (args.length) {
          Core.databaseManager.getGuildData(orgmes.guild.id).then((d) => {
            reply(args[0], Experiments.runExperimentOnServer(args[0], d) ? 'YES' : 'NO')
          }).catch(orgmes.reply)
        } else {
          reply('Experiments:', `\`\`\`json\n${JSON.stringify(Experiments.getRawData(), null, 2)}\`\`\``)
        }
        return true
    }

    return false
  }

}
