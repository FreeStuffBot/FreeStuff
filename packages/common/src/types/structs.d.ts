

export type Theme = {
  id: number
  name: string
  description: string
  emoji: string
  toggleCurrencies: boolean
  usesEmbeds: boolean
}


export type Currency = {
  id: number
  code: string
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
  moderated: boolean
  default: boolean
}