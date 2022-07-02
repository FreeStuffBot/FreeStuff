/* eslint-disable @typescript-eslint/no-unused-vars */
import { Fragile, SanitizedGuildType, SettingCurrency, SettingPlatform, SettingPriceClass, SettingTheme } from '@freestuffbot/common'
import { DatabaseActions } from './database-actions'



declare module 'cordo' {
  interface GuildData {
    changeSetting<T extends keyof DatabaseActions>(setting: T, value: DatabaseActions[T])

    fetch(): Promise<Fragile<Readonly<SanitizedGuildType>>>

    _cache?: Fragile<Readonly<SanitizedGuildType>>
  }
}
