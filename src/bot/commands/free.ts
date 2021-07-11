import Const from '../const'
import { ReplyableCommandInteraction } from '../../cordo/types/ibase'


export default function (i: ReplyableCommandInteraction) {
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

  const replyText = 'test :)'

  i.reply({
    title: '=cmd_free_title',
    description: replyText,
    footer: '=announcement_footer',
    _context: { website: Const.links.websiteClean }
  })
}
