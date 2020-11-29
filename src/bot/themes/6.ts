import { GuildData, Theme } from "../../types";
import { MessageOptions } from "discord.js";
import { Core } from "../../index";
import Const from "../../bot/const";
import { GameInfo } from "../../_apiwrapper/types";


export default class ThemeSix implements Theme {

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    return [
      (data.roleInstance && !settings.disableMention) ? data.roleInstance.toString() : '',
      {
        embed: {
          author: {
            name: Core.text(data, '=announcement_header')
          },
          title: content.title,
          url: content.url,
          footer: {
            text: settings.test
              ? Core.text(data, '=announcement_footer_test')
              : Core.text(data, '=announcement_footer', { website: Const.links.websiteClean })
          },
          image: {
            url: content.thumbnail
          },
          color: 0x2f3136,
          thumbnail: {
            url: Const.storeIcons[content.store] + '&size=32',
            width: 32,
            height: 32
          }
        }
      }
    ];
  }

}
