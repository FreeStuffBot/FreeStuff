import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { ThemeBuilder } from '../../types/context'
import { Core } from '../../index'
import Experiments from '../../controller/experiments'


export default class ThemeNine implements ThemeBuilder {

  public build(games: GameInfo[], data: GuildData, _settings: { test?: boolean }): MessageOptions {
    const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', data)

    const mention = (data.roleInstance ? data.roleInstance.toString() + ' ' : '')
    const links = games.map(game => Core.text(data, '=announcement_theme9', {
      name: (game.title.startsWith('=') ? Core.text(data, game.title) : game.title),
      url: (useProxyUrl ? game.urls.default : game.urls.org)
    }))

    const content = links.length > 1
      ? `${mention}\n${links.join('\n\n')}`
      : mention + links

    return { content }
  }

}
