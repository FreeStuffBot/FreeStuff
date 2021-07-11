import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { Theme } from '../../types/context'
import BaseTheme, { themeSettings } from './basetheme'


export default class ThemeTwo implements Theme {

  public readonly name = '=theme_two_name'
  public readonly description = '=theme_two_desc'
  public readonly emoji = '2️⃣'

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    const fullSettings: themeSettings = {
      ...settings,
      themeImages: false,
      themeExtraInfo: false
    }
    return BaseTheme.build(content, data, fullSettings)
  }

}
