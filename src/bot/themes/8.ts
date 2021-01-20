import { GuildData, Theme } from "../../types";
import { MessageOptions } from "discord.js";
import { GameInfo } from "freestuff";


export default class ThemeEight implements Theme {

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    return [
      ((data.roleInstance && !settings.disableMention) ? data.roleInstance.toString() : '')
      + ` <${content.url}>`,
      {}
    ];
  }

}
