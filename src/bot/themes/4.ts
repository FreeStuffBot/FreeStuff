import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { Theme } from '../../types/context'
import BaseTheme, { themeSettings } from './basetheme'


export default class ThemeFour implements Theme {

  public readonly name = '=theme_four_name'
  public readonly description = '=theme_four_desc'
  public readonly emoji = '4️⃣'

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    const fullSettings: themeSettings = {
      ...settings,
      themeImages: false,
      themeExtraInfo: true
    }
    return BaseTheme.build(content, data, fullSettings)
  }

}
