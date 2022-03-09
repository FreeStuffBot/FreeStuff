import { InteractionApplicationCommandCallbackData } from "cordo"
import { BaseTheme, Localisation, SanitizedGuildType, SanitizedProductType, ThemeBuilderClass } from ".."
import Timestamps from "../lib/timestamps"
import { roleIdToMention } from "./themeutils"


export default class ThemeTen implements ThemeBuilderClass {

  public build(products: SanitizedProductType[], guild: SanitizedGuildType, settings: { test?: boolean }): InteractionApplicationCommandCallbackData {
    const content = roleIdToMention(guild.role)
    const embeds = products.map(game => this.buildEmbed(game, guild, settings.test))

    return { content, embeds, _context: BaseTheme.defaultStaticContext }
  }

  private buildEmbed(product: SanitizedProductType, guild: SanitizedGuildType, test: boolean): Partial<InteractionApplicationCommandCallbackData["embeds"][number]> {
    const button = product.urls.client
      ? product.platform === 'steam'
        ? `${Localisation.text(guild, '=open_in_browser')}: [https://s.team/a/${product.urls.org.split('/app/')[1].split('/')[0]}](${product.urls.browser})\n${Localisation.text(guild, '=open_in_steam_client')}: ${product.urls.client}`
        : `${Localisation.text(guild, '=open_in_browser')}: [${product.urls.org}](${product.urls.browser})\n${Localisation.text(guild, '=open_in_epic_games_client')}: <${product.urls.client}>`
      : `[${Localisation.text(guild, '=open_in_browser')}](${product.urls.default})`

    const steamcontent = product.platform === 'steam'
      ? [
        `Subids: ${product.platformMeta.steamSubids}`,
        '',
        `addlicense asf ${product.platformMeta.steamSubids.split(' ').map(id => `s/${id}`).join(', ')}`
        ]
      : []

    const lines = [
      '```yaml',
      `  Name: ${product.title}`,
      ` Store: ${Localisation.text(guild, '=platform_' + product.platform)}`,
      ` Price: $${product.prices.find(p => p.currency === 'usd').oldValue} | €${product.prices.find(p => p.currency === 'usd').oldValue}`,
      ` Until: ${product.until ? Timestamps.parse(product.until).toLocaleDateString('en-GB') : 'unknown'}`,
      `  Tags: ${product.tags?.slice(0, 3).join(', ') ?? ''}`,
      `Rating: ${~~(product.rating * 100)}% positive`,
      ...steamcontent,
      '```',
      button
    ]

    return {
      author: {
        name: '=announcement_header'
      },
      description: lines.join('\n'),
      footer: {
        text: test
          ? '=announcement_footer_test'
          : '=announcement_footer'
      }
    }
  }

}
