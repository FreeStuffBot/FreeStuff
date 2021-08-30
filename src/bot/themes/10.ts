import { MessageEmbed, MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import Experiments from '../../controller/experiments'
import { GuildData } from '../../types/datastructs'
import { ThemeBuilder } from '../../types/context'
import { Core } from '../../index'
import Const from '../const'
import LanguageManager from '../../bot/language-manager'


export default class ThemeTen implements ThemeBuilder {

  public build(games: GameInfo[], data: GuildData, settings: { test?: boolean }): MessageOptions {
    const useProxyUrl = Experiments.runExperimentOnServer('use_proxy_url', data)
    const epicOpenInClient = Experiments.runExperimentOnServer('epic_open_in_client', data)

    const content = data.roleInstance ? data.roleInstance.toString() : ''
    const embeds = games.map(game => this.buildEmbed(game, data, settings.test, useProxyUrl, epicOpenInClient))

    return { content, embeds }
  }

  private buildEmbed(game: GameInfo, data: GuildData, test: boolean, useProxyUrl: boolean, _epicOpenInClient: boolean): Partial<MessageEmbed> {
    const button = game.urls.client
      ? game.store === 'steam'
        ? `${Core.text(data, '=open_in_browser')}: [https://s.team/a/${game.urls.org.split('/app/')[1].split('/')[0]}](${useProxyUrl ? game.urls.browser : game.urls.org})\n${Core.text(data, '=open_in_steam_client')}: ${game.urls.client}`
        : `[${Core.text(data, '=open_in_browser')}](${useProxyUrl ? game.urls.browser : game.urls.org}) • [${Core.text(data, '=open_in_epic_games_client')}](${game.urls.client})`
      : `[${Core.text(data, '=open_in_browser')}](${useProxyUrl ? game.urls.default : game.urls.org})`

    const steamcontent = game.store === 'steam'
      ? [
        `Subids: ${game.store_meta.steam_subids}`,
        '',
        `addlicense asf ${game.store_meta.steam_subids.split(' ').map(id => `s/${id}`).join(', ')}`
        ]
      : []

    const lines = [
      '```yaml',
      `  Name: ${game.title}`,
      ` Store: ${LanguageManager.get(data, 'platform_' + game.store)}`,
      ` Price: $${game.org_price.dollar} | €${game.org_price.euro}`,
      ` Until: ${game.until?.toLocaleDateString(LanguageManager.get(data, 'date_format')) ?? 'unknown'}`,
      `  Tags: ${game.tags?.slice(0, 3).join(', ') ?? ''}`,
      `Rating: ${~~(game.rating * 100)}% positive`,
      ...steamcontent,
      '```',
      button
    ]

    return {
      author: {
        name: Core.text(data, '=announcement_header')
      },
      description: lines.join('\n'),
      footer: {
        text: test
          ? Core.text(data, '=announcement_footer_test')
          : Core.text(data, '=announcement_footer', { website: Const.links.websiteClean })
      }
    }
  }

}
