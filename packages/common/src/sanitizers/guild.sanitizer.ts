import { Const, Localisation, SettingPlatform } from ".."
import { GuildDataType, SanitizedGuildType } from "../models/guild.model"


export class GuildSanitizer {

  // SETTINGS
  public static readonly BITS_CURRENCY_OFFSET = 5
  public static readonly BITS_CURRENCY_MASK = 0b1111
  public static readonly BITS_THEME_OFFSET = 0
  public static readonly BITS_THEME_MASK = 0b11111
  public static readonly BITS_LANGUAGE_OFFSET = 10
  public static readonly BITS_LANGUAGE_MASK = 0b111111
  public static readonly BIT_REACT_OFFSET = 9
  public static readonly BIT_BETA_OFFSET = 30

  // FILTER
  public static readonly BITS_PRICE_OFFSET = 2
  public static readonly BITS_PRICE_MASK = 0b11
  public static readonly BITS_PLATFORMS_OFFSET = 4
  public static readonly BITS_PLATFORMS_MASK = 0b11111111
  public static readonly BIT_TRASH_OFFSET = 0

  //

  public static sanitize(data: GuildDataType): SanitizedGuildType {
    if (!data) return null
    return {
      id: data._id,
      sharder: data.sharder,
      channel: data.channel,
      webhook: data.webhook,
      role: data.role,
      settings: data.settings,
      filter: data.filter,
      tracker: data.tracker,

      currency: Const.currencies[(data.settings >> GuildSanitizer.BITS_CURRENCY_OFFSET) & GuildSanitizer.BITS_CURRENCY_MASK] ?? Const.currencies[0],
      price: Const.priceClasses[(data.filter >> GuildSanitizer.BITS_PRICE_OFFSET) & GuildSanitizer.BITS_PRICE_MASK] ?? Const.priceClasses[2],
      react: (data.settings & (1 << GuildSanitizer.BIT_REACT_OFFSET)) !== 0,
      trashGames: (data.filter & (1 << GuildSanitizer.BIT_TRASH_OFFSET)) !== 0,
      theme: Const.themes[(data.settings >> GuildSanitizer.BITS_THEME_OFFSET) & GuildSanitizer.BITS_THEME_MASK] ?? Const.themes[0],
      language: Localisation.languageById((data.settings >> GuildSanitizer.BITS_LANGUAGE_OFFSET) & GuildSanitizer.BITS_LANGUAGE_MASK),
      platformsRaw: (data.filter >> GuildSanitizer.BITS_PLATFORMS_OFFSET) & GuildSanitizer.BITS_PLATFORMS_MASK,
      platformsList: GuildSanitizer.platformsRawToList((data.filter >> GuildSanitizer.BITS_PLATFORMS_OFFSET) & GuildSanitizer.BITS_PLATFORMS_MASK),
      beta: (data.settings & (1 << GuildSanitizer.BIT_BETA_OFFSET)) !== 0
    }
  }

  public static platformsRawToList(raw: number): SettingPlatform<any>[] {
    const out = [] as SettingPlatform<any>[]
    for (const platform of Const.platforms) {
      if ((raw & platform.bit) !== 0)
        out.push(platform)
    }

    return out
  }

}
