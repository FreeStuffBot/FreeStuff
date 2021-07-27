import Emojis from 'bot/emojis'
import { MessageOptions } from 'discord.js'
import { GameInfo, Store } from 'freestuff'
import { GuildData } from './datastructs'


/*
 * Types and enums provided for the bot's context specifically.
 */


export type GuildSetting = 'channel'
  | 'role' | 'theme'| 'currency'
  | 'react' | 'trash' | 'price'
  | 'language' | 'platforms' | 'beta'
  | 'tracker'


export type StoreData = {
  name: string
  key: Store
  icon: string
  bit: number
}


export interface ThemeBuilder {
  build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions]
}


export type Theme = {
  id: number
  name: string
  description: string
  emoji: string
  builder: ThemeBuilder
  toggleCurrencies: boolean
  usesEmbeds: boolean
}


export type Currency = {
  id: number
  name: string
  symbol: string
  /** whether this currency is calculated from usd/eur or is actually real data */
  calculated: boolean
}


export type PriceClass = {
  id: number
  from: number
  name: string
}


export type Platform = {
  id: string
  bit: number
  name: string
  description: string
  emoji: Emojis
  default: boolean
}

