import { GameInfo } from 'freestuff'
import { CommandInteraction, InteractionCommandHandler, InteractionReplyFunction } from '../../types/interactions'
import { GuildData } from '../../types/datastructs'
import Const from '../const'
import { Core } from '../../index'
import DatabaseManager from '../database-manager'
import Experiments from '../../controller/experiments'
import Logger from '../../lib/logger'
import Emojis from '../../lib/emojis'


export default class NewFreeCommand extends InteractionCommandHandler {

  // public constructor() {
  // super()

  // setInterval(() => {
  //   NewFreeCommand.updateCurrentFreebies()
  // }, 1000 * 60 * 60 * 1)
  // NewFreeCommand.updateCurrentFreebies()
  // }

  public handle(_command: CommandInteraction, data: GuildData, reply: InteractionReplyFunction): boolean {
    // const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', data)

    // const freeLonger: string[] = []
    // const freeToday: string[] = []
    // for (const game of NewFreeCommand.current) {
    //   // g happens to be undefined here at times, investigate
    //   const str = `${Const.storeEmojis[game.store] || ':gray_question:'} **[${game.title}](${useProxyUrl ? game.urls.default : game.urls.org})**\n${Emojis.bigSpace.string} ~~${data?.currency === 'euro' ? `${game.org_price.euro}€` : `$${game.org_price.dollar}`}~~ • ${Core.text(data, '=cmd_free_until')} ${game.until ? `<t:${game.until.getTime() / 1000}:${('_today' in game) ? 't' : 'd'}>` : 'unknown'}\n`
    //   if ('_today' in game) freeToday.push(str)
    //   else freeLonger.push(str)
    // }

    // let replyText = freeLonger.join('\n')
    // if (freeToday.length) replyText += `\n\n${Core.text(data, '=cmd_free_ends_soon')}\n\n${freeToday.join('\n')}`
    // if (!freeLonger.length && !freeToday.length) replyText = Core.text(data, '=cmd_free_no_freebies')

    // reply('ChannelMessageWithSource', {
    //   title: '=cmd_free_title',
    //   description: replyText,
    //   footer: '=announcement_footer',
    //   _context: { website: Const.links.websiteClean }
    // })
    // return true
  }

}
