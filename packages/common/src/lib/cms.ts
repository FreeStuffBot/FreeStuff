import { SanitizedCurrencyType } from "../models/currency.model"
import { LanguageDataType } from "../models/language.model"
import { SanitizedPlatformType } from "../models/platform.model"
import ApiInterface from "./api-interface"
import Localisation from "./localisation"


type CmsConstantsType = {
  currencies: SanitizedCurrencyType[]
  platforms: SanitizedPlatformType[]
}

export default class CMS {

  private static _languages: LanguageDataType[] = []
  public static get languages(): typeof CMS._languages {
    return CMS._languages
  }

  private static _constants: CmsConstantsType = { currencies: [], platforms: [] }
  public static get constants(): typeof CMS._constants {
    return CMS._constants
  }

  //

  public static loadAll() {
    CMS.loadLanguages()
  }

  public static async loadLanguages() {
    const lang = await ApiInterface.loadData<LanguageDataType[]>('languages')

    if (!lang?.length)
      return false

    CMS._languages = lang
    Localisation.load(lang)
    return true
  }

  public static async loadConstants() {
    const data = await ApiInterface.loadData<CmsConstantsType>('cms-constants')

    if (!data)
      return false

    CMS._constants = data
  }

}
