import { Guild } from 'discord.js'
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
  ];

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
  ];

  private static readonly EXTRA_LANGUAGE_HINTS = {
    brazil: 'pt-BR',
    hongkong: 'zh-CN',
    japan: 'zh-CN'
  }

  public static isGuildInEurope(guild: Guild) {
    if (!guild) return false
    const region = guild.region
    const europe = Localisation.EUROPEAN_REGIONS.includes(region)
    return europe
  }

  public static isGuildInAmerica(guild: Guild) {
    if (!guild) return false
    const region = guild.region
    const europe = Localisation.AMERICAN_REGIONS.includes(region)
    return europe
  }

  public static getDefaultSettings(guild: Guild): number {
    const europe = this.isGuildInEurope(guild)
    const defaultLang = europe ? 'en-GB' : 'en-US'

    return 0
      | Util.modifyBits(0, 5, 4, europe ? Const.currencies[0].id : Const.currencies[1].id)
      | Util.modifyBits(0, 10, 6, LanguageManager.languageToId(defaultLang))
  }

  public static getDefaultFilter(_guild: Guild): number {
    return 0
      | Util.modifyBits(0, 2, 2, Const.defaultPriceClass.id)
      | Util.modifyBits(0, 4, 8, Const.defaultPlatforms)
  }

  public static getTranslationHint(guild: Guild): string {
    const region = guild.region
    const europe = Localisation.EUROPEAN_REGIONS.includes(region)
    const hint = Localisation.EXTRA_LANGUAGE_HINTS[region]

    if (hint)
      return LanguageManager.getRaw(hint, 'translation_available')

    if (europe)
      return LanguageManager.getRaw(hint, 'translation_available_generic')

    return ''
  }

  public static renderPriceTag(data: GuildData, game: GameInfo) {
    const price = game.org_price.euro // TODO
    return LanguageManager.get(data, 'currency_sign_position') === 'after'
      ? `${price}${data.currency.symbol}`
      : `${data.currency.symbol}${price}`
  }

}
