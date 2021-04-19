import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData, Theme } from '../../types'
import { Core } from '../../index'


export default class ThemeNine implements Theme {

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    return [
      ((data.roleInstance && !settings.disableMention) ? data.roleInstance.toString() : '')
      + ' '
      + Core.text(data, '=announcement_theme9', { name: content.title, url: content.urls.default }),
      {}
    ]
  }

}
