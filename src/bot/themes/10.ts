import { GameInfo, GuildData, Theme } from "../../types";
import { MessageOptions } from "discord.js";
import { Core } from "../../index";
import Const from "../const";


export default class ThemeTen implements Theme {

  public build(content: GameInfo, data: GuildData, test: boolean): [string, MessageOptions] {
    const date = new Date(Date.now() + content.until * 1000 * 60 * 60 * 24);
    return [
      (data.roleInstance ? data.roleInstance.toString() : ''),
      {
        embed: {
          author: {
            name: Core.text(data, '=announcement_header')
          },
          description: `\`\`\`yaml\n  Name: ${content.title}\n Store: ${Const.storeDisplayNames[content.store]}\n Price: $${content.org_price.dollar} | €${content.org_price.euro}\n Until: ${date.toLocaleDateString(Core.languageManager.get(data, 'date_format'))}\nSubids: ${content.steamSubids}\n\n!addlicense asf ${content.steamSubids.split(' ').join(',')}\`\`\`\n[Open in Browser](${content.url})\n[Open in Steam Client](https://todo.com/)`,
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
