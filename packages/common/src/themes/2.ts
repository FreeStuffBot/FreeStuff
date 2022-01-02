import { GameInfo, GuildData, ThemeBuilder } from '@freestuffbot/typings'
import { InteractionApplicationCommandCallbackData } from 'cordo'
import BaseTheme from './basetheme'


export default class ThemeTwo implements ThemeBuilder {

  public build(games: GameInfo[], data: GuildData, settings: { test?: boolean, donationNotice?: boolean }): InteractionApplicationCommandCallbackData {
    return BaseTheme.build(games, data, {
      ...settings,
      themeImages: false,
      themeExtraInfo: false
    })
  }

}
