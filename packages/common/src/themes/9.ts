import { GameInfo, GuildData, ThemeBuilder } from "@freestuffbot/typings"
import { InteractionApplicationCommandCallbackData } from "cordo"
import Localisation from "../lib/localisation"
import { roleIdToMention } from "./themeutils"


export default class ThemeNine implements ThemeBuilder {

  public build(games: GameInfo[], data: GuildData, _settings: { test?: boolean }): InteractionApplicationCommandCallbackData {
    const mention = roleIdToMention(data.role)
    const links = games.map(game => Localisation.text(data, '=announcement_theme9', {
      name: (game.title.startsWith('=') ? Localisation.text(data, game.title) : game.title),
      url: game.urls.default
    }))

    const content = links.length > 1
      ? `${mention}\n${links.join('\n\n')}`
      : mention + links

    return { content }
  }

}
