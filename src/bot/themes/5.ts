import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { ThemeBuilder } from '../../types/context'
import { Core } from '../../index'
import Const from '../../bot/const'
import Experiments from '../../controller/experiments'


export default class ThemeFive implements ThemeBuilder {

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    return [
      (data.roleInstance && !settings.disableMention) ? data.roleInstance.toString() : '',
      {
        embed: {
          author: {
            name: Core.text(data, '=announcement_header')
          },
          title: content.title,
          url: Experiments.runExperimentOnServer('use_proxy_url', data)
            ? content.urls.default
            : content.urls.org,
          footer: {
            text: settings.test
              ? Core.text(data, '=announcement_footer_test')
              : Core.text(data, '=announcement_footer', { website: Const.links.websiteClean })
          },
          color: Const.embedDefaultColor
        }
      }
    ]
  }

}
