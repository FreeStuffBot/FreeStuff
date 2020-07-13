import { GameInfo, GuildData, Theme } from "../../types";
import { MessageOptions } from "discord.js";


export default class ThemeEight implements Theme {

  public build(content: GameInfo, data: GuildData, test: boolean): [string, MessageOptions] {
    return [
      (data.roleInstance ? data.roleInstance.toString() : '')
      + ` <${content.url}>`,
      {}
    ];
  }

}
