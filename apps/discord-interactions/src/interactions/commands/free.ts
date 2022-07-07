import { CMS, Const, Emojis, Errors, FSApiGateway, Localisation } from '@freestuffbot/common'
import { ReplyableCommandInteraction } from 'cordo'
import Tracker from '../../lib/tracker'


export default function (i: ReplyableCommandInteraction) {
  const freeLonger: string[] = []
  const freeToday: string[] = []

  const [ err, products ] = FSApiGateway.getChannel('keep')
  if (err) return void Errors.handleErrorAndCommunicate(err, i)

  for (const product of products) {
    const platformEmoji = CMS.getPlatformDiscordEmoji(product.platform).toString()
    const productLink = `**[${product.title}](${product.urls.default})**`
    const priceTag = `~~${Localisation.renderPriceTag(i, null, product)}~~ • ${Localisation.text(i, '=cmd_free_until')}`
    const until = product.until
      ? `<t:${~~(product.until / 1000)}:${('_today' in product) ? 't' : 'd'}>`
      : 'unknown'

    const str = `${platformEmoji} ${productLink}\n${Emojis.bigSpace.string} ${priceTag} ${until}\n`

    if ('_today' in product) freeToday.push(str)
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
