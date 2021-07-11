import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { Theme } from '../../types/context'
import Experiments from '../../controller/experiments'


export default class ThemeSeven implements Theme {

  public readonly name = '=theme_seven_name'
  public readonly description = '=theme_seven_desc'
  public readonly emoji = '7️⃣'

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', data)

    return [
      ((data.roleInstance && !settings.disableMention) ? data.roleInstance.toString() : '')
      + ' ' + (useProxyUrl ? content.urls.default : content.urls.org),
      {}
    ]
  }

}
