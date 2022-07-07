import { InteractionApplicationCommandCallbackData } from "cordo"
import { SanitizedGuildType, SanitizedProductType, ThemeBuilderClass } from ".."
import { roleIdToMention } from "./themeutils"


export default class ThemeEight implements ThemeBuilderClass {

  public build(products: SanitizedProductType[], guild: SanitizedGuildType, _settings: { test?: boolean }): InteractionApplicationCommandCallbackData {
    const mention = roleIdToMention(guild.role)
    const links = products.map(game => `<${game.urls.default}>`)

    const content = links.length > 1
      ? `${mention}\n${links.join('\n')}`
      : mention + ' ' + links

    return { content }
  }

}
