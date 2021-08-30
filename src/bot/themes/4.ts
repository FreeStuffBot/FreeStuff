import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { ThemeBuilder } from '../../types/context'
import BaseTheme, { themeSettings } from './basetheme'


export default class ThemeFour implements ThemeBuilder {

  public build(games: GameInfo[], data: GuildData, settings: { test?: boolean, disableMention?: boolean }): MessageOptions {
    const fullSettings: themeSettings = {
      ...settings,
      themeImages: false,
      themeExtraInfo: true
    }
    return BaseTheme.build(games, data, fullSettings)
  }

}
