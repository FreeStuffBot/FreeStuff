import { GameInfo, GuildData } from '@freestuffbot/typings'
import { Util } from '../lib/util'
import Const from './const'
import LanguageManager from './language-manager'


export default class Localisation {

  public static getDefaultSettings(): number {
    const defaultLang = 'en-GB'

    return 0
      | Util.modifyBits(0, 5, 4, Const.currencies[0].id)
      | Util.modifyBits(0, 10, 6, LanguageManager.languageToId(defaultLang))
  }

  public static getDefaultFilter(): number {
    return 0
      | Util.modifyBits(0, 2, 2, Const.defaultPriceClass.id)
      | Util.modifyBits(0, 4, 8, Const.defaultPlatforms)
  }

  public static renderPriceTag(data: GuildData, game: GameInfo) {
    const price = game.org_price[data.currency.code] || game.org_price.euro
    return LanguageManager.get(data, 'currency_sign_position') === 'after'
      ? `${price}${data.currency.symbol}`
      : `${data.currency.symbol}${price}`
  }

}
