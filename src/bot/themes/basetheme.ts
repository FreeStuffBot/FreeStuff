import { MessageOptions } from 'discord.js'
import { GameFlag, GameInfo } from 'freestuff'
import { Core } from '../../index'
import Const from '../../bot/const'
import { GuildData } from '../../types/datastructs'
import Experiments from '../../controller/experiments'


export type themeSettings = {
  test?: boolean,
  disableMention?: boolean,
  themeImages: boolean,
  themeExtraInfo: boolean
}

export default class BaseTheme {

  public static build(content: GameInfo, data: GuildData, settings: themeSettings): [string, MessageOptions] {
    const priceString = BaseTheme.generatePriceString(content, data)
    const until = BaseTheme.generateUntil(content, data)
    const button = BaseTheme.generateButton(content, data)
    const showDescription = content.description && settings.themeExtraInfo
    const showRating = content.rating && settings.themeExtraInfo
    const showStore = !until || !showRating || !settings.themeImages
    const divider = settings.themeExtraInfo ? ' ᲼ ᲼ ' : ' • '

    const description = BaseTheme.generateDescription(content, data, until, priceString, showDescription, showRating, showStore, divider, button)
    const image = BaseTheme.generateImageObject(content, data, settings)
    const thumbnail = BaseTheme.generateThumbnailObject(content, data, settings)
    const footer = BaseTheme.generateFooter(content, data, settings)

    const rawMessage = (data.roleInstance && !settings.disableMention)
      ? data.roleInstance.toString()
      : ''

    return [
      rawMessage,
      {
        embed: {
        // author: { name: Core.text(data, '=announcement_header') },
          title: content.title,
          description,
          image,
          footer,
          color: Const.embedDefaultColor,
          thumbnail
        }
      }
    ]
  }

  //

  static generateUntil(content: GameInfo, data: GuildData): string {
    if (!content.until) return ''

    if (data.altDateFormat) {
      const day = content.until.toLocaleDateString(
        Core.languageManager.get(data, 'date_format'),
        { weekday: 'long' }
      )
      const days = Math.round(Math.abs(
        (content.until.getTime() - new Date().getTime())
        / (1000 * 60 * 60 * 24)
      ))

      if (days < 7) return Core.text(data, '=announcement_free_until_day', { day })
      if (days === 7) return Core.text(data, '=announcement_free_for_a_week', { day })
      if (days < 14) return Core.text(data, '=announcement_free_until_day_next_week', { day })
      return Core.text(data, '=announcement_free_for_a_long_time')
    }

    return Core.text(data, '=announcement_free_until_date', {
      date: content.until.toLocaleDateString(Core.languageManager.get(data, 'date_format'))
    })
  }

  static generateButton(content: GameInfo, data: GuildData): string {
    const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', data)

    if (!content.urls.client)
      return `**[${Core.text(data, '=announcement_button_text')}](${useProxyUrl ? content.urls.default : content.urls.org})**`

    if (content.store === 'steam')
      return `${Core.text(data, '=open_in_browser')}: **[https://s.team/a/${content.urls.org.split('/app/')[1].split('/')[0]}](${useProxyUrl ? content.urls.browser : content.urls.org})**\n${Core.text(data, '=open_in_steam_client')}: **${content.urls.client}**`

    return `**[${Core.text(data, '=open_in_browser')}](${useProxyUrl ? content.urls.browser : content.urls.org})** • **[${Core.text(data, '=open_in_epic_games_client')}](${content.urls.client})**`
  }

  static generatePriceString(content: GameInfo, data: GuildData): string {
    return data.currency === 'euro'
      ? Core.languageManager.get(data, 'currency_sign_euro_position') === 'after'
          ? `${content.org_price.euro} €`
          : `€${content.org_price.euro}`
      : Core.languageManager.get(data, 'currency_sign_dollar_position') === 'after'
        ? `${content.org_price.dollar} $`
        : `$${content.org_price.dollar}`
  }

  static generateImageObject(content: GameInfo, data: GuildData, settings: themeSettings): Object {
    if (!settings.themeImages) return undefined

    return {
      url: !Experiments.runExperimentOnServer('announcement_tags', data)
        ? content.thumbnail.org
        : settings.themeExtraInfo
          ? content.thumbnail.full
          : content.thumbnail.blank
    }
  }

  static generateThumbnailObject(content: GameInfo, _data: GuildData, settings: themeSettings): Object {
    if (!settings.themeImages) return undefined

    return {
      url: (content.flags & GameFlag.THIRDPARTY)
        ? Const.storeIconsExt[content.store]
        : Const.storeIcons[content.store],
      width: 128,
      height: 128
    }
  }

  static generateDescription(content: GameInfo, data: GuildData, until: string, priceString: string, showDescription: boolean, showRating: boolean, showStore: boolean, divider: string, button: string) {
    return ''
      + (showDescription ? `> ${content.description}\n\n` : '')
      + `~~${priceString}~~ **${Core.text(data, '=announcement_pricetag_free')}** ${until}`
      + (showRating ? `${divider}${Math.round(content.rating * 20) / 2}/10 ★` : '')
      + (showStore ? `${divider}${Core.languageManager.get(data, 'platform_' + content.store)}` : '')
      // + ((content.flags & GameFlag.TRASH) ? `${divider}${Core.text(data, '=game_meta_flag_trash')}` : '')
      // + ((content.flags & GameFlag.THIRDPARTY) ? `${divider}${Core.text(data, '=game_meta_flag_thirdparty')}` : '')
      + `\n\n${button}`
  }

  static generateFooter(_content: GameInfo, data: GuildData, settings: themeSettings) {
    return {
      text: settings.test
        ? Core.text(data, '=announcement_footer_test')
        : Core.text(data, '=announcement_footer', { website: Const.links.websiteClean })
    }
  }

}
