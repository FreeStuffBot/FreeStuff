import { GameInfo, GuildData, Theme, GameFlag } from "../../types";
import { MessageOptions } from "discord.js";
import { Core } from "../../index";
import Const from "../../bot/const";


export default class ThemeEight implements Theme {

  public build(content: GameInfo, data: GuildData, test: boolean): [string, MessageOptions] {
    return [
      (data.roleInstance ? data.roleInstance.toString() : '')
      + ` <${content.url}>`,
      {}
    ];
  }

}
