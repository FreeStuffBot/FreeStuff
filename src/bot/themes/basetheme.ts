import { GuildData } from "../../types";
import { MessageOptions } from "discord.js";
import { Core } from "../../index";
import Const from "../../bot/const";
import { GameFlag, GameInfo } from "freestuff";


export type themeSettings = {
  test?: boolean,
  disableMention?: boolean,
  themeImages: boolean,
  themeExtraInfo: boolean
}

export default class BaseTheme {

  public static build(content: GameInfo, data: GuildData, settings: themeSettings): [string, MessageOptions] {
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

    const button = content.urls.client
      ? content.store === 'steam'
        ? `${Core.text(data, '=open_in_browser')}: **[https://s.team/a/${content.urls.browser.split('/app/')[1].split('/')[0]}](${content.urls.browser})**\n${Core.text(data, '=open_in_steam_client')}: **${content.urls.client}**`
        : `**[${Core.text(data, '=open_in_browser')}](${content.urls.browser})** • **[${Core.text(data, '=open_in_epic_games_client')}](${content.urls.client})**`
      : `**[${Core.text(data, '=announcement_button_text')}](${content.urls.default})**`

    const showDescription = content.description && settings.themeExtraInfo
    const showRating = content.rating && settings.themeExtraInfo
    const showStore = !until || !showRating || !settings.themeImages

    const divider = settings.themeExtraInfo ? ' ᲼ ᲼ ' : ' • '

    const description = ''
      + (showDescription ? `> ${content.description}\n\n` : '')
      + `~~${priceString}~~ **${Core.text(data, '=announcement_pricetag_free')}** ${until}`
      + (showRating ? `${divider}${Math.round(content.rating * 20)/2}/10 ★` : '')
      + (showStore ? `${divider}${Core.languageManager.get(data, 'platform_' + content.store)}` : '')
      // + ((content.flags & GameFlag.TRASH) ? `${divider}${Core.text(data, '=game_meta_flag_trash')}` : '')
      // + ((content.flags & GameFlag.THIRDPARTY) ? `${divider}${Core.text(data, '=game_meta_flag_thirdparty')}` : '')
      + `\n\n${button}`

    let image = undefined
    let thumbnail = undefined
    if (settings.themeImages) {
      image = {
        url: !Core.sharder.runExperimentOnServer('announcement_tags', data)
          ? content.thumbnail.org
          : settings.themeExtraInfo
            ? content.thumbnail.full
            : content.thumbnail.blank
      }

      thumbnail = {
        url: (content.flags & GameFlag.THIRDPARTY)
          ? Const.storeIconsExt[content.store]
          : Const.storeIcons[content.store],
        width: 128,
        height: 128
      }
    }

    const footer = {
      text: settings.test
        ? Core.text(data, '=announcement_footer_test')
        : Core.text(data, '=announcement_footer', { website: Const.links.websiteClean })
    }

    const rawMessage = (data.roleInstance && !settings.disableMention)
      ? data.roleInstance.toString()
      : ''

    return [
      rawMessage,
      { embed: {
          // author: { name: Core.text(data, '=announcement_header') },
          title: content.title,
          description,
          image,
          footer,
          color: 0x2f3136,
          thumbnail
      } }
    ];
  }

}
