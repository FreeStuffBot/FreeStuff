import { Guild } from 'discord.js'
import { Core } from '../index'
import { Util } from '../lib/util'


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
    honkong: 'zh-CN',
    japan: 'zh-CN'
  }

  public isGuildInEurope(guild: Guild) {
    if (!guild) return false
    const region = guild.region
    const europe = Localisation.EUROPEAN_REGIONS.includes(region)
    return europe
  }

  public isGuildInAmerica(guild: Guild) {
    if (!guild) return false
    const region = guild.region
    const europe = Localisation.AMERICAN_REGIONS.includes(region)
    return europe
  }

  public getDefaultSettings(guild: Guild): number {
    const europe = this.isGuildInEurope(guild)
    const useEuro = europe
    const defaultLang = europe ? 'en-GB' : 'en-US'

    return 0
      | Util.modifyBits(0, 1, 1, useEuro ? 0 : 1)
      | Util.modifyBits(0, 8, 6, Core.languageManager.languageToId(defaultLang))
      | Util.modifyBits(0, 14, 8, 0b11111111)
  }

  public getTranslationHint(guild: Guild): string {
    const region = guild.region
    const europe = Localisation.EUROPEAN_REGIONS.includes(region)
    const hint = Localisation.EXTRA_LANGUAGE_HINTS[region]

    if (hint)
      return Core.languageManager.getRaw(hint, 'translation_available')

    if (europe)
      return Core.languageManager.getRaw(hint, 'translation_available_generic')

    return ''
  }

}
