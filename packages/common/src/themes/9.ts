import { InteractionApplicationCommandCallbackData } from "cordo"
import { SanitizedGuildType, SanitizedProductType, ThemeBuilderClass } from ".."
import Localisation from "../lib/localisation"
import { roleIdToMention } from "./themeutils"


export default class ThemeNine implements ThemeBuilderClass {

  public build(products: SanitizedProductType[], guild: SanitizedGuildType, _settings: { test?: boolean }): InteractionApplicationCommandCallbackData {
    const mention = roleIdToMention(guild.role)
    const links = products.map(game => Localisation.text(guild, '=announcement_theme9', {
      name: (game.title.startsWith('=') ? Localisation.text(guild, game.title) : game.title),
      url: game.urls.default
    }))

    const content = links.length > 1
      ? `${mention}\n${links.join('\n\n')}`
      : mention + links

    return { content }
  }

}
