import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { ThemeBuilder } from '../../types/context'
import BaseTheme, { themeSettings } from './basetheme'


export default class ThemeThree implements ThemeBuilder {

  public build(games: GameInfo[], data: GuildData, settings: { test?: boolean, donationNotice?: boolean }): MessageOptions {
    const fullSettings: themeSettings = {
      ...settings,
      themeImages: true,
      themeExtraInfo: true
    }
    return BaseTheme.build(games, data, fullSettings)
  }

}
