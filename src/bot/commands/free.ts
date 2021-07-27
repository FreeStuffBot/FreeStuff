import { ReplyableCommandInteraction } from 'cordo'
import { Core } from '../..'
import Experiments from '../../controller/experiments'
import AnnouncementManager from '../announcement-manager'
import Const from '../const'
import Emojis from '../emojis'
import Localisation from '../localisation'
import Tracker from '../tracker'


export default function (i: ReplyableCommandInteraction) {
  const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', i.guildData)

  const freeLonger: string[] = []
  const freeToday: string[] = []
  for (const game of AnnouncementManager.getCurrentFreebies()) {
    // g happens to be undefined here at times, investigate
    const str = `${Emojis.store[game.store] || ':gray_question:'} **[${game.title}](${useProxyUrl ? game.urls.default : game.urls.org})**\n${Emojis.bigSpace.string} ~~${Localisation.renderPriceTag(i.guildData, game)}~~ • ${Core.text(i.guildData, '=cmd_free_until')} ${game.until ? `<t:${game.until.getTime() / 1000}:${('_today' in game) ? 't' : 'd'}>` : 'unknown'}\n`
    if ('_today' in game) freeToday.push(str)
    else freeLonger.push(str)
  }

  let replyText = freeLonger.join('\n')
  if (freeToday.length) replyText += `\n\n${Core.text(i.guildData, '=cmd_free_ends_soon')}\n\n${freeToday.join('\n')}`
  if (!freeLonger.length && !freeToday.length) replyText = Core.text(i.guildData, '=cmd_free_no_freebies')

  Tracker.set(i.guildData, 'PAGE_DISCOVERED_FREE_GAMES_LIST')

  i.reply({
    title: '=cmd_free_title',
    description: replyText,
    footer: '=announcement_footer',
    _context: { website: Const.links.websiteClean }
  })
}
