import { Fragile, SanitizedGuildType, SettingCurrency, SettingPlatform, SettingPriceClass, SettingTheme } from '@freestuffbot/common'



declare module 'cordo' {
  interface GuildData {
    changeSetting(setting: 'channel' | 'role' | 'webhook', value: string | null)
    changeSetting(setting: 'react' | 'trash' | 'beta', value: boolean)
    changeSetting(setting: 'language' | 'tracker', value: number)
    changeSetting(setting: 'price', value: SettingPriceClass<any>)
    changeSetting(setting: 'theme', value: number | SettingTheme<any>)
    changeSetting(setting: 'currency', value: number | SettingCurrency<any>)
    changeSetting(setting: 'platforms', value: SettingPlatform<any>[] | number)

    fetch(): Promise<Fragile<Readonly<SanitizedGuildType>>>

    _cache?: Fragile<Readonly<SanitizedGuildType>>
  }
}
