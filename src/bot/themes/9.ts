import { GuildData, Theme } from "../../types";
import { MessageOptions } from "discord.js";
import { Core } from "../../index";
import { GameInfo } from "../../_apiwrapper/types";


export default class ThemeNine implements Theme {

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    return [
      ((data.roleInstance && !settings.disableMention) ? data.roleInstance.toString() : '')
      + ' '
      + Core.text(data, '=announcement_theme9', { name: content.title, url: content.url }),
      {}
    ];
  }

}
