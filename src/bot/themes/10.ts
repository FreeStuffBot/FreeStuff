import { GuildData, Theme } from "../../types";
import { MessageOptions } from "discord.js";
import { Core } from "../../index";
import Const from "../const";
import { GameInfo } from "../../_apiwrapper/types";


export default class ThemeTen implements Theme {

  public build(content: GameInfo, data: GuildData, test: boolean): [string, MessageOptions] {
    const lines = [
      '```yaml',
      `  Name: ${content.title}`,
      ` Store: ${Const.storeDisplayNames[content.store]}`,
      ` Price: $${content.org_price.dollar} | €${content.org_price.euro}`,
      ` Until: ${content.until?.toLocaleDateString(Core.languageManager.get(data, 'date_format')) ?? 'unknown'}`,
      `Subids: ${content.store_meta.steam_subids}`,
      '',
      `!addlicense asf ${content.store_meta.steam_subids.split(' ').join(',')}`,
      '```',
      `[${Core.text(data, '=open_in_browser')}](${content.url})`,
      `[${Core.text(data, '=open_in_steam_client')}](${content.url})`, // TODO insert real url
    ]
    return [
      (data.roleInstance ? data.roleInstance.toString() : ''),
      {
        embed: {
          author: {
            name: Core.text(data, '=announcement_header')
          },
          description: lines.join('\n'),
          footer: {
            text: test
              ? Core.text(data, '=announcement_footer_test')
              : Core.text(data, '=announcement_footer', { website: Const.websiteLinkClean })
          }
        }
      }
    ];
  }

}
