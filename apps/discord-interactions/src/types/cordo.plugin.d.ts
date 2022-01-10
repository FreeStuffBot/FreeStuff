import { GuildData } from 'cordo'
import { GuildData as GuildDataType, Currency, Platform, PriceClass, Theme } from '@freestuffbot/typings'


interface Changeable {
  changeSetting(setting: 'channel' | 'role' | 'webhook', value: string | null)
  changeSetting(setting: 'react' | 'trash' | 'beta', value: boolean)
  changeSetting(setting: 'language' | 'tracker', value: number)
  changeSetting(setting: 'price', value: PriceClass)
  changeSetting(setting: 'theme', value: number | Theme)
  changeSetting(setting: 'currency', value: number | Currency)
  changeSetting(setting: 'platforms', value: Platform[] | number)
  // changeSetting(setting: string, value: any)
}

declare module 'cordo' {
  interface GuildData extends Readonly<GuildDataType>, Changeable {}
}
