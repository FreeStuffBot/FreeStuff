import { InteractionApplicationCommandCallbackData } from 'cordo'
import { SanitizedGuildType, SanitizedProductType, ThemeBuilderClass } from ".."
import BaseTheme from './basetheme'


export default class ThemeThree implements ThemeBuilderClass {

  public build(products: SanitizedProductType[], guild: SanitizedGuildType, settings: { test?: boolean, donationNotice?: boolean }): InteractionApplicationCommandCallbackData {
    return BaseTheme.build(products, guild, {
      ...settings,
      themeImages: true,
      themeExtraInfo: true
    })
  }

}
