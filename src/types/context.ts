import { GameInfo, GuildData } from '@freestuffbot/typings'
import { MessageOptions } from 'discord.js'


/*
 * Types and enums provided for the bot's context specifically.
 */


export type GuildSetting = 'channel'
  | 'role' | 'theme'| 'currency'
  | 'react' | 'trash' | 'price'
  | 'language' | 'platforms' | 'beta'
  | 'tracker' | 'webhook'


export interface ThemeBuilder {
  build(content: GameInfo[], data: GuildData, settings: { test?: boolean, donationNotice?: boolean }): MessageOptions
}

