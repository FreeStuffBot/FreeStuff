import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { Theme } from '../../types/context'
import BaseTheme, { themeSettings } from './basetheme'


export default class ThemeThree implements Theme {

  public readonly name = '=theme_three_name'
  public readonly description = '=theme_three_desc'
  public readonly emoji = '3️⃣'

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    const fullSettings: themeSettings = {
      ...settings,
      themeImages: true,
      themeExtraInfo: true
    }
    return BaseTheme.build(content, data, fullSettings)
  }

}
