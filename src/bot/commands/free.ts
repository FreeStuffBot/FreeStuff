import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import Const from '../const'
import { Core } from '../../index'
import Experiments from '../../controller/experiments'
import NewFreeCommand from '../slashcommands/free'
import Emojis from '../../lib/emojis'


export default class FreeCommand extends Command {

  public constructor() {
    super({
      name: 'free',
      desc: '=cmd_free_desc',
      trigger: [ 'free', 'currenlty', 'current', 'what', 'whats', 'what\'s', 'what´s', 'what`s' ]
    })
  }

  public handle(mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    const cont = mes.content.toLowerCase()
    if (cont.startsWith('what'))
      if (!cont.match(/what.? ?i?s? +(currently)? ?free/)) return

    const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', g)

    const freeLonger: string[] = []
    const freeToday: string[] = []
    for (const game of NewFreeCommand.getCurrentFreebies()) {
      // g happens to be undefined here at times, investigate
      const str = `${Const.storeEmojis[game.store] || ':gray_question:'} **[${game.title}](${useProxyUrl ? game.urls.default : game.urls.org})**\n${Emojis.bigSpace.string} ~~${g?.currency === 'euro' ? `${game.org_price.euro}€` : `$${game.org_price.dollar}`}~~ • ${Core.text(g, '=cmd_free_until')} ${game.until ? `<t:${game.until.getTime() / 1000}:${('_today' in game) ? 't' : 'd'}>` : 'unknown'}\n`
      if ('_today' in game) freeToday.push(str)
      else freeLonger.push(str)
    }

    let replyText = freeLonger.join('\n')
    if (freeToday.length) replyText += `\n\n${Core.text(g, '=cmd_free_ends_soon')}\n\n${freeToday.join('\n')}`
    if (!freeLonger.length && !freeToday.length) replyText = Core.text(g, '=cmd_free_no_freebies')
    replyText += '\n\n:new: ' + Core.text(g, '=slash_command_introduction_label_long', { command: '/free' })
    repl(Core.text(g, '=cmd_free_title'), replyText)
    return true
  }

}
