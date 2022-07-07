import { InteractionApplicationCommandCallbackData } from "cordo"
import Const from "../data/const"
import CMS from "../lib/cms"
import Localisation from "../lib/localisation"
import { SanitizedGuildType } from "../models/guild.model"
import { SanitizedProductType } from "../models/product.model"
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

  public static build(product: SanitizedProductType[], guild: SanitizedGuildType, settings: themeSettings): InteractionApplicationCommandCallbackData {
    const content = roleIdToMention(guild.role)
    const embeds = product.map(p => this.buildEmbed(p, guild, settings))

    if (settings.donationNotice) {
      embeds.push({
        description: Localisation.text(guild, '=donation_notice', { url: Const.links.donate }),
        color: Const.embedDefaultColor
      })
    }

    return { content, embeds, _context: this.defaultStaticContext }
  }

  //

  static buildEmbed(product: SanitizedProductType, guild: SanitizedGuildType, settings: themeSettings): Partial<MessageEmbed> {
    const priceString = Localisation.renderPriceTag(guild, guild.currency, product)
    const until = BaseTheme.generateUntil(product, guild)
    const button = BaseTheme.generateButton(product, guild)
    const showDescription = product.description && settings.themeExtraInfo
    const showRating = product.rating && settings.themeExtraInfo
    const showStore = !until || !showRating || !settings.themeImages
    const title = product.title
    const divider = settings.themeExtraInfo
      ? `${Const.invisibleCharacter} `.repeat(6).substring(1)
      : ' • '

    const btnText = button[0] === 'text' ? button[1] : undefined
    const fields = button[0] === 'fields' ? button[1] : undefined

    const description = BaseTheme.generateDescription(product, guild, until, priceString, showDescription, showRating, showStore, divider, btnText)
    const image = BaseTheme.generateImageObject(product, guild, settings)
    const thumbnail = BaseTheme.generateThumbnailObject(product, guild, settings)
    const footer = BaseTheme.generateFooter(product, guild, settings)

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

  static generateUntil(product: SanitizedProductType, guild: SanitizedGuildType): string {
    if (!product.until) return ''

    return Localisation.text(guild, '=announcement_free_until_date', {
      date: `<t:${~~(product.until / 1000)}:d>`
    })
  }

  static generateButton(product: SanitizedProductType, guild: SanitizedGuildType): [ 'text', string ] | [ 'fields', MessageEmbed["fields"] ] {
    if (!product.urls.client) {
      return [
        'text',
        `**[${Localisation.text(guild, '=announcement_button_text')}](${product.urls.default})**`
      ]
    }

    if (product.platform === 'steam') {
      return [
        'fields',
        [
          {
            name: '=open_in_browser',
            value: `**[https://s.team/a/${product.urls.org.split('/app/')[1].split('/')[0]}](${product.urls.browser})**`,
            inline: true
          },
          {
            name: '=open_in_steam_client',
            value: `**${product.urls.client}**`,
            inline: true
          }
        ]
      ]
    }

    if (product.platform === 'epic') {
      return [
        'fields',
        [
          {
            name: '=open_in_browser',
            value: `**[${product.urls.org.replace('www.', '').replace('/en-US', '')}](${product.urls.browser})**`,
            inline: true
          },
          {
            name: '=open_in_epic_games_client',
            value: `**<${product.urls.client}>**`,
            inline: true
          }
        ]
      ]
    }

    return [
      'text',
      `**[${Localisation.text(guild, '=announcement_button_text')}](${product.urls.default})**`
    ]
  }

  static generateImageObject(product: SanitizedProductType, _guild: SanitizedGuildType, settings: themeSettings): MessageEmbed['image'] {
    if (!settings.themeImages) return undefined

    return {
      url: settings.themeExtraInfo
        ? (product.thumbnails.full ?? product.thumbnails.org)
        : (product.thumbnails.blank ?? product.thumbnails.org)
    }
  }

  static generateThumbnailObject(product: SanitizedProductType, _guild: SanitizedGuildType, settings: themeSettings): MessageEmbed['thumbnail'] {
    if (!settings.themeImages) return undefined

    return {
      // TODO(low) external platform icon
      // url: (product.flags & ProductFlag.THIRDPARTY)
      //   ? Const.platformIconsExt[product.platform]
      //   : Const.platformIcons[product.platform],
      url: CMS.getPlatformIconUrl(product.platform),
      width: 128,
      height: 128
    }
  }

  static generateDescription(product: SanitizedProductType, guild: SanitizedGuildType, until: string, priceString: string, showDescription: boolean, showRating: boolean, showStore: boolean, divider: string, button: string) {
    return ''
      + (showDescription ? `> ${product.description.startsWith('=') ? Localisation.text(guild, product.description) : product.description}\n\n` : '')
      + `~~${priceString}~~ **${Localisation.text(guild, '=announcement_pricetag_free')}** ${until}`
      + (showRating ? `${divider}${Math.round(product.rating * 20) / 2}/10 ★` : '')
      + (showStore ? `${divider}${Localisation.getLine(guild, 'platform_' + product.platform)}` : '')
      + (button ? `\n\n${button}` : `\n** **${Const.invisibleCharacter}`)
  }

  static generateFooter(_product: SanitizedProductType, _guild: SanitizedGuildType, settings: themeSettings) {
    return {
      text: settings.test
        ? '=announcement_footer_test'
        : '=announcement_footer'
    }
  }

}
