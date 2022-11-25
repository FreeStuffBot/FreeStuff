import { InteractionApplicationCommandCallbackData } from "cordo"
import { SanitizedGuildType, SanitizedProductType, ThemeBuilderClass } from ".."
import Const from "../data/const"
import CMS from "../lib/cms"
import { roleIdToMention } from "./themeutils"


export default class ThemeSix implements ThemeBuilderClass {

  public build(products: SanitizedProductType[], guild: SanitizedGuildType, settings: { test?: boolean, donationNotice?: boolean }): InteractionApplicationCommandCallbackData {
    const content = roleIdToMention(guild.role)
    const embeds = products.map(product => ({
      author: {
        name: '=announcement_header'
      },
      title: product.title,
      url: product.urls.default,
      footer: {
        text: settings.test
          ? '=announcement_footer_test'
          : '=announcement_footer'
      },
      image: {
        url: product.thumbnails.full
      },
      color: Const.embedDefaultColor,
      thumbnail: {
        url: CMS.getPlatformIconUrl(product.platform),
        width: 32,
        height: 32
      }
    }))

    return { content, embeds, _context: { website: Const.links.website } }
  }

}
