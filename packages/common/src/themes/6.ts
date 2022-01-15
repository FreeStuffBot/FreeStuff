import { InteractionApplicationCommandCallbackData } from "cordo"
import { SanitizedGuildType, SanitizedProductType, ThemeBuilderClass } from ".."
import Const from "../data/const"
import { roleIdToMention } from "./themeutils"


export default class ThemeSix implements ThemeBuilderClass {

  public build(products: SanitizedProductType[], guild: SanitizedGuildType, settings: { test?: boolean, donationNotice?: boolean }): InteractionApplicationCommandCallbackData {
    const content = roleIdToMention(guild.role)
    const embeds = products.map(game => ({
      author: {
        name: '=announcement_header'
      },
      title: game.title,
      url: game.urls.default,
      footer: {
        text: settings.test
          ? '=announcement_footer_test'
          : '=announcement_footer'
      },
      image: {
        url: game.thumbnails.full
      },
      color: Const.embedDefaultColor,
      thumbnail: {
        url: Const.platformIcons[game.platform] + '&size=32',
        width: 32,
        height: 32
      }
    }))

    return { content, embeds }
  }

}
