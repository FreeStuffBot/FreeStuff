import Const from "../data/const"
import Emojis from "../data/emojis"
import { SanitizedCurrencyType } from "../models/currency.model"
import { LanguageDataType } from "../models/language.model"
import { SanitizedPlatformType } from "../models/platform.model"
import { Fragile } from "../struct/fragile.struct"
import ApiInterface from "./api-interface"
import Errors from "./errors"
import Localisation from "./localisation"


type CmsConstantsType = {
  currencies: SanitizedCurrencyType[]
  platforms: SanitizedPlatformType[]
}

export default class CMS {

  private static _languages: LanguageDataType[] = null
  private static _constants: CmsConstantsType = { currencies: null, platforms: null }

  //

  public static get languages(): Fragile<LanguageDataType[]> {
    if (CMS._languages)
      return Errors.success(CMS._languages)

    return Errors.throwStderrNotInitialized('common::cms.get.languages')
  }

  public static get currencies(): Fragile<SanitizedCurrencyType[]> {
    if (CMS._constants.currencies?.length)
      return Errors.success(CMS._constants.currencies)

    return Errors.throwStderrNotInitialized('common::cms.get.currencies')
  }

  public static get platforms(): Fragile<SanitizedPlatformType[]> {
    if (CMS._constants.platforms?.length)
      return Errors.success(CMS._constants.platforms)

    return Errors.throwStderrNotInitialized('common::cms.get.platforms')
  }

  //

  public static getPlatformIconUrl(platformCode: string): string {
    const plat = CMS._constants.platforms?.find(p => p && p?.code === platformCode)
    if (plat) return plat.assets.icon ?? Const.platformIconFiller
    return Const.platformIconFiller
  }

  public static getPlatformDiscordEmoji(platformCode: string): Emojis {
    const plat = CMS._constants.platforms?.find(p => p && p.code === platformCode)
    if (plat) return Emojis.fromString(plat.assets.discordEmoji) ?? Emojis.unknownPlatform
    return Emojis.unknownPlatform
  }

  //

  public static loadAll(): Promise<boolean> {
    return Promise.all([
      CMS.loadLanguages(),
      CMS.loadConstants()
    ]).then(p => p.reduce((a, b) => a && b, true))
  }

  public static async loadLanguages(): Promise<boolean> {
    const lang = await ApiInterface.loadData<LanguageDataType[]>('languages')

    if (!lang?.length)
      return false

    CMS._languages = lang
    Localisation.load(lang)
    return true
  }

  public static async loadConstants(): Promise<boolean> {
    const data = await ApiInterface.loadData<CmsConstantsType>('cms-constants')

    if (!data)
      return false

    if (data.currencies?.length) {
      CMS._constants.currencies = []
      for (const currency of data.currencies)
        CMS._constants.currencies[currency.id] = currency
    }

    if (data.platforms?.length) {
      CMS._constants.platforms = []
      for (const platform of data.platforms)
        CMS._constants.platforms[platform.id] = platform
    }

    return true
  }

}
