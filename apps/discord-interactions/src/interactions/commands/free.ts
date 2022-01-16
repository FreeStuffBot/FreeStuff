import { Const, Emojis, Localisation } from '@freestuffbot/common'
import { ReplyableCommandInteraction } from 'cordo'
import Errors from '../../lib/errors'
import Tracker from '../../lib/tracker'
import FreestuffData from '../../services/freestuff-data'


export default function (i: ReplyableCommandInteraction) {
  const freeLonger: string[] = []
  const freeToday: string[] = []

  const [ err, games ] = FreestuffData.getCurrentFreebies()
  if (err) return void Errors.handleErrorAndCommunicate(err, i)

  for (const game of games) {
    // g happens to be undefined here at times, investigate
    const str = `${Emojis.store[game.platform] || ':gray_question:'} **[${game.title}](${game.urls.default})**\n${Emojis.bigSpace.string} ~~${Localisation.renderPriceTag(i, game)}~~ • ${Localisation.text(i, '=cmd_free_until')} ${game.until ? `<t:${game.until / 1000}:${('_today' in game) ? 't' : 'd'}>` : 'unknown'}\n`
    if ('_today' in game) freeToday.push(str)
    else freeLonger.push(str)
  }

  let replyText = freeLonger.join('\n')
  if (freeToday.length) replyText += `\n\n${Localisation.text(i, '=cmd_free_ends_soon')}\n\n${freeToday.join('\n')}`
  if (!freeLonger.length && !freeToday.length) replyText = Localisation.text(i, '=cmd_free_no_freebies')

  Tracker.set(i.guildData, 'PAGE_DISCOVERED_FREE_GAMES_LIST')

  i.reply({
    title: '=cmd_free_title',
    description: replyText,
    footer: '=announcement_footer',
    _context: { website: Const.links.websiteClean }
  })
}
