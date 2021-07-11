import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { ThemeBuilder } from '../../types/context'
import BaseTheme, { themeSettings } from './basetheme'


export default class ThemeTwo implements ThemeBuilder {

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    const fullSettings: themeSettings = {
      ...settings,
      themeImages: false,
      themeExtraInfo: false
    }
    return BaseTheme.build(content, data, fullSettings)
  }

}
