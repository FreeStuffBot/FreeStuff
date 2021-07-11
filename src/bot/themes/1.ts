import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { Theme } from '../../types/context'
import BaseTheme, { themeSettings } from './basetheme'


export default class ThemeOne implements Theme {

  public readonly name = '=theme_one_name'
  public readonly description = '=theme_one_desc'
  public readonly emoji = '1️⃣'

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    const fullSettings: themeSettings = {
      ...settings,
      themeImages: true,
      themeExtraInfo: false
    }
    return BaseTheme.build(content, data, fullSettings)
  }

}
