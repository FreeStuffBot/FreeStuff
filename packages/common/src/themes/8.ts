import { GameInfo, GuildData, ThemeBuilder } from "@freestuffbot/typings"
import { InteractionApplicationCommandCallbackData } from "cordo"
import { roleIdToMention } from "./themeutils"


export default class ThemeEight implements ThemeBuilder {

  public build(games: GameInfo[], data: GuildData, _settings: { test?: boolean }): InteractionApplicationCommandCallbackData {
    const mention = roleIdToMention(data.role)
    const links = games.map(game => `<${game.urls.default}>`)

    const content = links.length > 1
      ? `${mention}\n${links.join('\n')}`
      : mention + links

    return { content }
  }

}
