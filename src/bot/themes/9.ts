import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { ThemeBuilder } from '../../types/context'
import { Core } from '../../index'
import Experiments from '../../controller/experiments'


export default class ThemeNine implements ThemeBuilder {

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', data)

    return [
      ((data.roleInstance && !settings.disableMention) ? data.roleInstance.toString() : '')
      + ' '
      + Core.text(data, '=announcement_theme9', {
        name: content.title,
        url: (useProxyUrl ? content.urls.default : content.urls.org)
      }),
      {}
    ]
  }

}
