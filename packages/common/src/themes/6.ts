import { GameInfo, GuildData, ThemeBuilder } from "@freestuffbot/typings"
import { InteractionApplicationCommandCallbackData } from "cordo"
import Const from "../const"
import { roleIdToMention } from "./themeutils"


export default class ThemeSix implements ThemeBuilder {

  public build(games: GameInfo[], data: GuildData, settings: { test?: boolean, donationNotice?: boolean }): InteractionApplicationCommandCallbackData {
    const content = roleIdToMention(data.role)
    const embeds = games.map(game => ({
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
        url: game.thumbnail.full
      },
      color: Const.embedDefaultColor,
      thumbnail: {
        url: Const.storeIcons[game.store] + '&size=32',
        width: 32,
        height: 32
      }
    }))

    return { content, embeds }
  }

}
