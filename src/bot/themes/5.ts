import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { ThemeBuilder } from '../../types/context'
import { Core } from '../../index'
import Const from '../../bot/const'
import Experiments from '../../controller/experiments'


export default class ThemeFive implements ThemeBuilder {

  public build(games: GameInfo[], data: GuildData, settings: { test?: boolean, disableMention?: boolean }): MessageOptions {
    const content = data.roleInstance ? data.roleInstance.toString() : ''
    const embeds = games.map(game => ({
      author: {
        name: Core.text(data, '=announcement_header')
      },
      title: game.title,
      url: Experiments.runExperimentOnServer('use_proxy_url', data)
        ? game.urls.default
        : game.urls.org,
      footer: {
        text: settings.test
          ? Core.text(data, '=announcement_footer_test')
          : Core.text(data, '=announcement_footer', { website: Const.links.websiteClean })
      },
      color: Const.embedDefaultColor
    }))

    return { content, embeds }
  }

}
