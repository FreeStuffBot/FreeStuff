import { GameInfo, GuildData, Theme } from "../../types";
import { MessageOptions } from "discord.js";
import { Core } from "../../index";


export default class ThemeNine implements Theme {

  public build(content: GameInfo, data: GuildData, test: boolean): [string, MessageOptions] {
    return [
      (data.roleInstance ? data.roleInstance.toString() : '')
      + ' '
      + Core.text(data, '=announcement_theme9', { name: content.title, url: content.url }),
      {}
    ];
  }

}
