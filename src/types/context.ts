import { MessageOptions } from 'discord.js'
import { GameInfo, Store } from 'freestuff'
import { GuildData } from './datastructs'


/*
 * Types and enums provided for the bot's context specifically.
 */


export type GuildSetting = 'channel'
  | 'roleMention' | 'theme'| 'currency'
  | 'react' | 'trash' | 'price'
  | 'language' | 'stores' | 'beta'


export enum FilterableStore {
  OTHER = 1 << 0,
  STEAM = 1 << 1,
  EPIC = 1 << 2,
  HUMBLE = 1 << 3,
  GOG = 1 << 4,
  ORIGIN = 1 << 5,
  UPLAY = 1 << 6,
  ITCH = 1 << 7
}


export type StoreData = {
  name: string
  key: Store
  icon: string
  bit: number
}


export interface Theme {
  readonly name: string
  readonly description: string
  readonly emoji: string
  build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions]
}


export type Currency = {
  name: string,
  symbol: string,
  value: number,
  /** whether this currency is calculated from usd/eur or is actually real data */
  calculated: boolean
}

