import { InteractionApplicationCommandCallbackData } from 'cordo'
import { SanitizedGuildType, SanitizedProductType, ThemeBuilderClass } from ".."
import Const from '../data/const'
import { roleIdToMention } from './themeutils'


export default class ThemeFive implements ThemeBuilderClass {

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
      color: Const.embedDefaultColor
    }))

    const _context = {
      website: Const.links.websiteClean
    }

    return { content, embeds, _context }
  }

}
