

export type SettingTheme<ID extends string> = {
  id: ID
  name: string
  description: string
  emoji: string
  toggleCurrencies: boolean
  usesEmbeds: boolean
}


export type SettingCurrency<ID extends string> = {
  id: ID
  code: string
  name: string
  symbol: string
  /** whether this currency is calculated from usd/eur or is actually real data */
  calculated: boolean
}


export type SettingPriceClass<ID extends string> = {
  id: ID
  from: number
  name: string
}


export type SettingPlatform<ID extends string> = {
  id: ID
  bit: number
  name: string
  description: string
  moderated: boolean
  default: boolean
}