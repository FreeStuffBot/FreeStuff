import { GuildData } from 'cordo'
import { GuildData as GuildDataType, Currency, Platform, PriceClass, Theme } from '@freestuffbot/typings'
import { Fragile } from '@freestuffbot/common'



declare module 'cordo' {
  interface GuildData {
    changeSetting(setting: 'channel' | 'role' | 'webhook', value: string | null)
    changeSetting(setting: 'react' | 'trash' | 'beta', value: boolean)
    changeSetting(setting: 'language' | 'tracker', value: number)
    changeSetting(setting: 'price', value: PriceClass)
    changeSetting(setting: 'theme', value: number | Theme)
    changeSetting(setting: 'currency', value: number | Currency)
    changeSetting(setting: 'platforms', value: Platform[] | number)
    
    fetch(): Promise<Fragile<Readonly<GuildDataType>>>

    _cache?: Fragile<Readonly<GuildDataType>>
  }
}
