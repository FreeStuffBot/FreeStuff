import { GuildData, Theme } from "../../types";
import { MessageOptions } from "discord.js";
import { Core } from "../../index";
import Const from "../../bot/const";
import { GameFlag, GameInfo } from "freestuff";


export default class ThemeOne implements Theme {

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    const priceString = data.currency == 'euro'
      ? Core.languageManager.get(data, 'currency_sign_euro_position') == 'after'
        ? `${content.org_price.euro} €`
        : `€${content.org_price.euro}`
      : Core.languageManager.get(data, 'currency_sign_dollar_position') == 'after'
        ? `${content.org_price.dollar} $`
        : `$${content.org_price.dollar}`;

    let until = '';
    if (content.until) {
      if (data.altDateFormat) {
        const day = content.until.toLocaleDateString(Core.languageManager.get(data, 'date_format'), { weekday: 'long' });
        const days = Math.round(Math.abs((content.until.getTime() - new Date().getTime()) / (1000*60*60*24)));
        if (days < 7) until = Core.text(data, '=announcement_free_until_day', { day });
        else if (days == 7) until = Core.text(data, '=announcement_free_for_a_week', { day });
        else if (days < 14) until = Core.text(data, '=announcement_free_until_day_next_week', { day });
        else until = Core.text(data, '=announcement_free_for_a_long_time');
      } else {
        until = Core.text(data, '=announcement_free_until_date', {
          date: content.until.toLocaleDateString(Core.languageManager.get(data, 'date_format'))
        });
      }
    }

    return [
      (data.roleInstance && !settings.disableMention) ? data.roleInstance.toString() : '',
      {
        embed: {
          author: {
            name: Core.text(data, '=announcement_header')
          },
          title: content.title,
          description: `~~${priceString}~~ **${Core.text(data, '=announcement_pricetag_free')}** ${until} • ${Core.languageManager.get(data, 'platform_' + content.store)}${(content.flags & GameFlag.TRASH) ? ` • ${Core.text(data, '=game_meta_flag_trash')}` : ''}${(content.flags & GameFlag.THIRDPARTY) ? ` • ${Core.text(data, '=game_meta_flag_thirdparty')}` : ''}\n\n**[${Core.text(data, '=announcement_button_text')}](${content.url})**`,
          image: {
            url: Core.sharder.runExperimentOnServer('announcement_tags', data)
              ? content.thumbnail.full
              : content.thumbnail.org
          },
          footer: {
            text: settings.test
              ? Core.text(data, '=announcement_footer_test')
              : Core.text(data, '=announcement_footer', { website: Const.links.websiteClean })
          },
          color: 0x2f3136,
          thumbnail: {
            url: Const.storeIcons[content.store],
            width: 128,
            height: 128
          }
        }
      }
    ];
  }

}
