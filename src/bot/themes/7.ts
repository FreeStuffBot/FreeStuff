import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { Theme } from '../../types/context'


export default class ThemeSeven implements Theme {

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    return [
      ((data.roleInstance && !settings.disableMention) ? data.roleInstance.toString() : '')
      + ' ' + content.urls.default,
      {}
    ]
  }

}
