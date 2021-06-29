import { Message } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import Const from '../const'
import { Core } from '../../index'
import Experiments from '../../controller/experiments'


export default class FreeCommand extends Command {

  public constructor() {
    super({
      name: 'free',
      desc: '=cmd_free_desc',
      trigger: [ 'free', 'currenlty', 'current', 'what', 'whats', 'what\'s', 'what´s', 'what`s' ]
    })

    setInterval(() => {
      FreeCommand.updateCurrentFreebies()
    }, 1000 * 60 * 60 * 1)
    FreeCommand.updateCurrentFreebies()
  }

  public handle(mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    const cont = mes.content.toLowerCase()
    if (cont.startsWith('what'))
      if (!cont.match(/what.? ?i?s? +(currently)? ?free/)) return

    const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', g)

    const freeLonger: string[] = []
    const freeToday: string[] = []
    for (const game of FreeCommand.current) {
      // g happens to be undefined here at times, investigate
      const str = `${Const.storeEmojis[game.store] || ':gray_question:'} **[${game.title}](${useProxyUrl ? game.urls.default : game.urls.org})**\n${Const.bigSpace} ~~${g?.currency === 'euro' ? `${game.org_price.euro}€` : `$${game.org_price.dollar}`}~~ • ${Core.text(g, '=cmd_free_until')} ${game.until?.toLocaleDateString(Core.languageManager.get(g, 'date_format')) ?? 'unknown'}\n`
      if ('_today' in game) freeToday.push(str)
      else freeLonger.push(str)
    }

    let replyText = freeLonger.join('\n')
    if (freeToday.length) replyText += `\n\n${Core.text(g, '=cmd_free_ends_soon')}\n\n${freeToday.join('\n')}`
    if (!freeLonger.length && !freeToday.length) replyText = Core.text(g, '=cmd_free_no_freebies')
    repl(Core.text(g, '=cmd_free_title'), replyText)
    return true
  }

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
