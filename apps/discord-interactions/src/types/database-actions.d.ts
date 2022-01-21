import { SettingCurrency, SettingPlatform, SettingPriceClass, SettingTheme } from "@freestuffbot/common"
import { Long } from "bson"


export type DatabaseActions = {
  channel: Long | null
  role: Long | null
  webhook: string | null
  react: boolean
  trash: boolean
  beta: boolean
  language: number
  tracker: number
  price: SettingPriceClass<any>
  theme: SettingTheme<any>
  currency: SettingCurrency<any>
  platforms: SettingPlatform<any>[]
}
