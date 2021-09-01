import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { ThemeBuilder } from '../../types/context'
import Experiments from '../../controller/experiments'


export default class ThemeSeven implements ThemeBuilder {

  public build(games: GameInfo[], data: GuildData, _settings: { test?: boolean }): MessageOptions {
    const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', data)

    const mention = (data.roleInstance ? data.roleInstance.toString() + ' ' : '')
    const links = games.map(game => (useProxyUrl ? game.urls.default : game.urls.org))

    const content = links.length > 1
      ? `${mention}\n${links.join('\n')}`
      : mention + links

    return { content }
  }

}
