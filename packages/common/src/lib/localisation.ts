import { GameInfo, GuildData } from '@freestuffbot/typings'
import { GenericMongodbObject } from '../types'


export default class Localisation {

  private static list: string[] = []
  private static idmap: Record<string, string> = {}
  private static texts: Record<string, Record<string, string>> = {}

  public static load(languages: GenericMongodbObject<string>[]) {
    const all = languages.sort((a, b) => a._id.startsWith('en')
      ? -1
      : b._id.startsWith('en')
        ? 1
        : 0
    )
    
    Localisation.list = []
    Localisation.idmap = {}
    Localisation.texts = {}

    for (const lang of all) {
      for (const key in lang) {
        if (key.startsWith('_')) continue
        lang[key] = (lang[key] as string).split('\\n').join('\n')
      }

      Localisation.list.push(lang._id)
      Localisation.idmap[lang._index as string] = lang._id
      Localisation.texts[lang._id] = lang as Record<string, string>
    }
  }

  public static getLine(d: GuildData, key: string): string {
    return Localisation.getRaw(d?.language ?? Localisation.list[0], key, true)
  }

  public static getRaw(language: string, key: string, fallback = true): string {
    if (!Localisation.list.length) return key
    if (!fallback) return Localisation.fetch(language, key) || key
    if (!language || !Localisation.texts[language]) return Localisation.fetch(Localisation.idmap[0], key) || key
    return Localisation.fetch(language, key) || Localisation.fetch(Localisation.idmap[0], key) || key
  }

  private static fetch(language: string, key: string): string {
    return Localisation.texts[language]?.[key]
  }

  public static existsLanguageById(id: number | string): boolean {
    return !!Localisation.idmap[id + '']
  }

  public static languageById(id: number | string): string {
    return Localisation.idmap[id + ''] || Localisation.idmap[0]
  }

  public static languageToId(lang: string): number {
    for (const key in Localisation.idmap) {
      if (Localisation.idmap[key] === lang)
        return parseInt(key, 10)
    }
    return -1
  }

  public static languageByName(query: string): string {
    query = query.toLowerCase()
    for (const lang of Localisation.list) {
      if (Localisation.fetch(lang, 'lang_name').toLowerCase() === query) return lang
      if (Localisation.fetch(lang, 'lang_name_en').toLowerCase() === query) return lang
    }
    for (const lang of Localisation.list)
      if (lang.startsWith(query)) return lang

    for (const lang of Localisation.list) {
      if (Localisation.fetch(lang, 'lang_name').toLowerCase().includes(query)) return lang
      if (Localisation.fetch(lang, 'lang_name_en').toLowerCase().includes(query)) return lang
    }
    return ''
  }

  public static getAllLanguages(): { id: string, name: string, nameEn: string, flag: string, ranking: number }[] {
    return Localisation.list.map(lang => ({
      id: lang,
      name: Localisation.fetch(lang, 'lang_name'),
      nameEn: Localisation.fetch(lang, 'lang_name_en'),
      flag: Localisation.fetch(lang, 'lang_flag_emoji'),
      ranking: parseInt(Localisation.fetch(lang, '_ranking') + '', 10)
    }))
  }

  /**
   * Recursively traverses the given object until maxDepth, translating every string value found
   */
  public static translateObject<T extends Object>(object: T, guildData: GuildData | undefined, context: any, maxDepth: number): T {
    if (maxDepth <= 0) return null
    for (const key in object) {
      if (key === '_context') continue
      if (typeof object[key] === 'object') Localisation.translateObject(object[key], guildData, context, maxDepth - 1)
      else if (typeof object[key] === 'string') object[key as any] = Localisation.text(guildData, object[key as any], context)
    }
    return object
  }

  /**
   * Finds any language keys within the given text and translates them
   * @param d Guild Data to base the language on
   * @param text The text to process
   * @param context The translation context with variables
   * @returns The processed text
   */
  public static text(d: GuildData, text: string, context?: { [varname: string]: string }): string {
    let out = (text.startsWith('=')
      ? Localisation.getRaw(d?.language, text.substr(1), true)
      : text)
    if (context) {
      for (const key in context)
        out = out.split(`{${key}}`).join(context[key])
    }
    return out
  }

  /**
   * Renders a price tag properly
   */
  public static renderPriceTag(data: GuildData, game: GameInfo) {
    const price = game.org_price[data.currency.code] || game.org_price.euro
    return Localisation.getLine(data, 'currency_sign_position') === 'after'
      ? `${price}${data.currency.symbol}`
      : `${data.currency.symbol}${price}`
  }

}
