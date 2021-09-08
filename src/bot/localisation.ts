import { GameInfo } from 'freestuff'
import { Util } from '../lib/util'
import { GuildData } from '../types/datastructs'
import Const from './const'
import LanguageManager from './language-manager'


export default class Localisation {

  private static readonly EUROPEAN_REGIONS = [
    'eu-west',
    'eu-east',
    'eu-central',
    'eu-north',
    'eu-south',
    'frankfurt',
    'london',
    'russia',
    'europe',
    'eu',
    'amsterdam',
    'dubai'
  ]

  private static readonly AMERICAN_REGIONS = [
    'us-west',
    'us-east',
    'us-north',
    'us-south',
    'us-central',
    'us',
    'america',
    'eastcoast',
    'westcoast',
    'north-america',
    'na',
    'south-america',
    'sa'
  ]

  private static readonly EXTRA_LANGUAGE_HINTS = {
    brazil: 'pt-BR',
    hongkong: 'zh-CN',
    japan: 'zh-CN'
  }

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
