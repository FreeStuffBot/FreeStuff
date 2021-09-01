import { MessageEmbed, MessageOptions } from 'discord.js'
import { GameFlag, GameInfo } from 'freestuff'
import { Core } from '../../index'
import Const from '../../bot/const'
import { GuildData } from '../../types/datastructs'
import Experiments from '../../controller/experiments'
import LanguageManager from '../../bot/language-manager'
import Localisation from '../localisation'


export type themeSettings = {
  test?: boolean,
  disableMention?: boolean,
  themeImages: boolean,
  themeExtraInfo: boolean
}

export default class BaseTheme {

  public static build(games: GameInfo[], data: GuildData, settings: themeSettings): MessageOptions {
    // only once per month - maybe redis entry to save last month and if unequal to current month, do this?

    const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', data)
    const epicOpenInClient = Experiments.runExperimentOnServer('epic_open_in_client', data)

    const content = data.roleInstance ? data.roleInstance.toString() : ''
    const embeds = games.map(game => this.buildEmbed(game, data, settings, useProxyUrl, epicOpenInClient))
    // embeds.push({
    //   description: 'Did this bot save you some money? If so, consider [donating](https://freestuffbot.xyz/donate) to keep it alive. Thanks!',
    //   color: Const.embedDefaultColor
    // })

    return { content, embeds }
  }

  //

  static buildEmbed(game: GameInfo, data: GuildData, settings: themeSettings, useProxyUrl: boolean, epicOpenInClient: boolean): Partial<MessageEmbed> {
    const priceString = Localisation.renderPriceTag(data, game)
    const until = BaseTheme.generateUntil(game, data)
    const button = BaseTheme.generateButton(game, data, useProxyUrl, epicOpenInClient)
    const showDescription = game.description && settings.themeExtraInfo
    const showRating = game.rating && settings.themeExtraInfo
    const showStore = !until || !showRating || !settings.themeImages
    const divider = settings.themeExtraInfo ? ' ᲼ ᲼ ' : ' • '
    const title = game.title.startsWith('=') ? Core.text(data, game.title) : game.title

    const description = BaseTheme.generateDescription(game, data, until, priceString, showDescription, showRating, showStore, divider, button)
    const image = BaseTheme.generateImageObject(game, data, settings)
    const thumbnail = BaseTheme.generateThumbnailObject(game, data, settings)
    const footer = BaseTheme.generateFooter(game, data, settings)

    return {
      title,
      description,
      image,
      footer,
      color: Const.embedDefaultColor,
      thumbnail
    }
  }

  //

  static generateUntil(game: GameInfo, data: GuildData): string {
    if (!game.until) return ''

    return Core.text(data, '=announcement_free_until_date', {
      date: `<t:${game.until.getTime() / 1000}:d>`
    })
  }

  static generateButton(game: GameInfo, data: GuildData, useProxyUrl: boolean, epicOpenInClient: boolean): string {
    if (!game.urls.client)
      return `**[${Core.text(data, '=announcement_button_text')}](${useProxyUrl ? game.urls.default : game.urls.org})**`

    if (game.store === 'steam')
      return `${Core.text(data, '=open_in_browser')}: **[https://s.team/a/${game.urls.org.split('/app/')[1].split('/')[0]}](${useProxyUrl ? game.urls.browser : game.urls.org})**\n${Core.text(data, '=open_in_steam_client')}: **${game.urls.client}**`

    if (epicOpenInClient && game.store === 'epic')
      return `${Core.text(data, '=open_in_browser')}: **[${game.urls.org.replace('www.', '').replace('/en-US', '')}](${useProxyUrl ? game.urls.browser : game.urls.org})**\n${Core.text(data, '=open_in_epic_games_client')}: **<${game.urls.client}>**`

    return `**[${Core.text(data, '=announcement_button_text')}](${useProxyUrl ? game.urls.default : game.urls.org})**`
  }

  static generateImageObject(game: GameInfo, data: GuildData, settings: themeSettings): MessageEmbed['image'] {
    if (!settings.themeImages) return undefined

    return {
      url: !Experiments.runExperimentOnServer('announcement_tags', data)
        ? game.thumbnail.org
        : settings.themeExtraInfo
          ? game.thumbnail.full
          : game.thumbnail.blank
    }
  }

  static generateThumbnailObject(game: GameInfo, _data: GuildData, settings: themeSettings): MessageEmbed['thumbnail'] {
    if (!settings.themeImages) return undefined

    return {
      url: (game.flags & GameFlag.THIRDPARTY)
        ? Const.storeIconsExt[game.store]
        : Const.storeIcons[game.store],
      width: 128,
      height: 128
    }
  }

  static generateDescription(game: GameInfo, data: GuildData, until: string, priceString: string, showDescription: boolean, showRating: boolean, showStore: boolean, divider: string, button: string) {
    return ''
      + (showDescription ? `> ${game.description.startsWith('=') ? Core.text(data, game.description) : game.description}\n\n` : '')
      + `~~${priceString}~~ **${Core.text(data, '=announcement_pricetag_free')}** ${until}`
      + (showRating ? `${divider}${Math.round(game.rating * 20) / 2}/10 ★` : '')
      + (showStore ? `${divider}${LanguageManager.get(data, 'platform_' + game.store)}` : '')
      + `\n\n${button}`
  }

  static generateFooter(_game: GameInfo, data: GuildData, settings: themeSettings) {
    return {
      text: settings.test
        ? Core.text(data, '=announcement_footer_test')
        : Core.text(data, '=announcement_footer', { website: Const.links.websiteClean })
    }
  }

}
