import { GameFlag, GameInfo, GuildData } from "@freestuffbot/typings"
import { InteractionApplicationCommandCallbackData } from "cordo"
import Const from "../const"
import Localisation from "../lib/localisation"
import { roleIdToMention } from "./themeutils"


type themeSettings = {
  test?: boolean,
  donationNotice?: boolean,
  themeImages: boolean,
  themeExtraInfo: boolean
}

type MessageEmbed = InteractionApplicationCommandCallbackData["embeds"][number]

export default class BaseTheme {
  
  public static readonly defaultStaticContext = {
    website: Const.links.websiteClean
  }

  //

  public static build(games: GameInfo[], data: GuildData, settings: themeSettings): InteractionApplicationCommandCallbackData {
    const content = roleIdToMention(data.role)
    const embeds = games.map(game => this.buildEmbed(game, data, settings))

    if (settings.donationNotice) {
      embeds.push({
        description: Localisation.text(data, '=donation_notice', { url: Const.links.donate }),
        color: Const.embedDefaultColor
      })
    }

    return { content, embeds, _context: this.defaultStaticContext }
  }

  //

  static buildEmbed(game: GameInfo, data: GuildData, settings: themeSettings): Partial<MessageEmbed> {
    const priceString = Localisation.renderPriceTag(data, game)
    const until = BaseTheme.generateUntil(game, data)
    const button = BaseTheme.generateButton(game, data)
    const showDescription = game.description && settings.themeExtraInfo
    const showRating = game.rating && settings.themeExtraInfo
    const showStore = !until || !showRating || !settings.themeImages
    const divider = settings.themeExtraInfo ? ' ᲼ ᲼ ' : ' • '
    const title = game.title

    const btnText = button[0] === 'text' ? button[1] : undefined
    const fields = button[0] === 'fields' ? button[1] : undefined

    const description = BaseTheme.generateDescription(game, data, until, priceString, showDescription, showRating, showStore, divider, btnText)
    const image = BaseTheme.generateImageObject(game, data, settings)
    const thumbnail = BaseTheme.generateThumbnailObject(game, data, settings)
    const footer = BaseTheme.generateFooter(game, data, settings)

    return {
      title,
      description,
      image,
      footer,
      fields,
      color: Const.embedDefaultColor,
      thumbnail
    }
  }

  //

  static generateUntil(game: GameInfo, data: GuildData): string {
    if (!game.until) return ''

    return Localisation.text(data, '=announcement_free_until_date', {
      date: `<t:${game.until.getTime() / 1000}:d>`
    })
  }

  static generateButton(game: GameInfo, data: GuildData): [ 'text', string ] | [ 'fields', MessageEmbed["fields"] ] {
    if (!game.urls.client) {
      return [
        'text',
        `**[${Localisation.text(data, '=announcement_button_text')}](${game.urls.default})**`
      ]
    }

    if (game.store === 'steam') {
      return [
        'fields',
        [
          {
            name: '=open_in_browser',
            value: `**[https://s.team/a/${game.urls.org.split('/app/')[1].split('/')[0]}](${game.urls.browser})**`,
            inline: true
          },
          {
            name: '=open_in_steam_client',
            value: `**${game.urls.client}**`,
            inline: true
          }
        ]
      ]
    }

    if (game.store === 'epic') {
      return [
        'fields',
        [
          {
            name: '=open_in_browser',
            value: `**[${game.urls.org.replace('www.', '').replace('/en-US', '')}](${game.urls.browser})**`,
            inline: true
          },
          {
            name: '=open_in_epic_games_client',
            value: `**<${game.urls.client}>**`,
            inline: true
          }
        ]
      ]
    }

    return [
      'text',
      `**[${Localisation.text(data, '=announcement_button_text')}](${game.urls.default})**`
    ]
  }

  static generateImageObject(game: GameInfo, _data: GuildData, settings: themeSettings): MessageEmbed['image'] {
    if (!settings.themeImages) return undefined

    return {
      url: settings.themeExtraInfo
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
      + (showDescription ? `> ${game.description.startsWith('=') ? Localisation.text(data, game.description) : game.description}\n\n` : '')
      + `~~${priceString}~~ **${Localisation.text(data, '=announcement_pricetag_free')}** ${until}`
      + (showRating ? `${divider}${Math.round(game.rating * 20) / 2}/10 ★` : '')
      + (showStore ? `${divider}${Localisation.getLine(data, 'platform_' + game.store)}` : '')
      + (button ? `\n\n${button}` : `\n** **${Const.invisibleCharacter}`)
  }

  static generateFooter(_game: GameInfo, _data: GuildData, settings: themeSettings) {
    return {
      text: settings.test
        ? '=announcement_footer_test'
        : '=announcement_footer'
    }
  }

}
