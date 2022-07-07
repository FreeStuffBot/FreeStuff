

export type SettingTheme<ID extends string> = {
  id: ID
  name: string
  description: string
  emoji: string
  toggleCurrencies: boolean
  usesEmbeds: boolean
}


export type SettingPriceClass<ID extends string> = {
  id: ID
  from: number
  name: string
}
