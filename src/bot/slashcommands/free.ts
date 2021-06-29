import { GameInfo } from 'freestuff'
import { Interaction, InteractionCommandHandler, InteractionReplyFunction } from '../../types/interactions'
import { GuildData } from '../../types/datastructs'
import Const from '../const'
import { Core } from '../../index'
import Experiments from '../../controller/experiments'


export default class NewFreeCommand extends InteractionCommandHandler {

  public constructor() {
    super()

    setInterval(() => {
      NewFreeCommand.updateCurrentFreebies()
    }, 1000 * 60 * 60 * 1)
    NewFreeCommand.updateCurrentFreebies()
  }

  public handle(_command: Interaction, data: GuildData, reply: InteractionReplyFunction): boolean {
    const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', data)

    const freeLonger: string[] = []
    const freeToday: string[] = []
    for (const game of NewFreeCommand.current) {
      // g happens to be undefined here at times, investigate
      const str = `${Const.storeEmojis[game.store] || ':gray_question:'} **[${game.title}](${useProxyUrl ? game.urls.default : game.urls.org})**\n${Const.bigSpace} ~~${data?.currency === 'euro' ? `${game.org_price.euro}€` : `$${game.org_price.dollar}`}~~ • ${Core.text(data, '=cmd_free_until')} ${game.until?.toLocaleDateString(Core.languageManager.get(data, 'date_format')) ?? 'unknown'}\n`
      if ('_today' in game) freeToday.push(str)
      else freeLonger.push(str)
    }

    let replyText = freeLonger.join('\n')
    if (freeToday.length) replyText += `\n\n${Core.text(data, '=cmd_free_ends_soon')}\n\n${freeToday.join('\n')}`
    if (!freeLonger.length && !freeToday.length) replyText = Core.text(data, '=cmd_free_no_freebies')

    reply('ChannelMessageWithSource', {
      title: '=cmd_free_title',
      description: replyText,
      footer: {
        text: '=announcement_footer'
      },
      context: { website: Const.links.websiteClean }
    })
    return true
  }

  //

  private static readonly TWELVE_HOURS = 1000 * 60 * 60 * 12;
  private static current: GameInfo[] = [];

  public static async updateCurrentFreebies() {
    const ids = await Core.fsapi.getGameList('free')
    const data = await Core.fsapi.getGameDetails(ids, 'info')
    let games = Object.values(data)

    const currentTime = new Date()
    games = games
      .filter(g => g.until && g.until.getTime() > currentTime.getTime())
      .sort((a, b) => b.until.getTime() - a.until.getTime())
    games.forEach((g) => {
      if (g.until.getTime() - currentTime.getTime() < this.TWELVE_HOURS)
        (g as any)._today = true
    })

    this.current = games
  }

  public static getCurrentFreebies(): GameInfo[] {
    return this.current
  }

}
