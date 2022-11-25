import { GenericInteraction } from 'cordo'
import { SanitizedGuildType, SanitizedProductType, CurrencyDataType, SanitizedCurrencyType, Const } from '..'


export type LocaleContainer = SanitizedGuildType | GenericInteraction | string

export default class Localisation {

  private static readonly DEFAULT_LANGUAGE_ID = 'en-US'

  private static list: Set<string> = new Set()
  private static idmap: Map<number, string> = new Map()
  private static texts: Map<string, Record<string, string>> = new Map()
  private static closestMatch: Map<string, string> = new Map()

  public static load(languages: Record<string, any>[], append = false) {
    const all = languages.sort((a, b) => a._id.startsWith('en')
      ? -1
      : b._id.startsWith('en')
        ? 1
        : 0
    )

    if (!append) {
      Localisation.list = new Set()
      Localisation.idmap = new Map()
      Localisation.texts = new Map()
    }

    for (const lang of all) {
      for (const key in lang) {
        if (key.startsWith('_')) continue
        lang[key] = (lang[key] as string).split('\\n').join('\n')
      }

      if (append) {
        const obj = Localisation.texts.get(lang._id)
        for (const key in lang)
          obj[key] = lang[key]
      } else {
        Localisation.list.add(lang._id)
        Localisation.idmap.set(lang._index, lang._id)
        Localisation.texts.set(lang._id, lang as Record<string, string>)
      }
    }
  }

  public static getLine(d: LocaleContainer, key: string): string {
    return Localisation.getRaw(Localisation.getLocaleFromContainer(d), key, true)
  }

  public static getRaw(language: string, key: string, fallback = true): string {
    if (!Localisation.list.size) return key
    if (!fallback) return Localisation.fetch(language, key) || key
    if (!language || !Localisation.texts.has(language)) return Localisation.fetch(Localisation.DEFAULT_LANGUAGE_ID, key) || key
    return Localisation.fetch(language, key) || Localisation.fetch(Localisation.DEFAULT_LANGUAGE_ID, key) || key
  }

  private static fetch(language: string, key: string): string {
    return Localisation.texts.get(language)?.[key]
  }

  public static existsLanguageById(id: number): boolean {
    return !!Localisation.idmap.get(id)
  }

  public static languageById(id: number): string {
    return Localisation.idmap.get(id) || Localisation.DEFAULT_LANGUAGE_ID
  }

  public static languageToId(lang: string): number {
    for (const key of Localisation.idmap.keys()) {
      if (Localisation.idmap.get(key) === lang)
        return key
    }
    return -1
  }

  public static languageByName(query: string): string {
    query = query.toLowerCase()
    for (const lang of Localisation.list.values()) {
      if (Localisation.fetch(lang, 'lang_name').toLowerCase() === query) return lang
      if (Localisation.fetch(lang, 'lang_name_en').toLowerCase() === query) return lang
    }
    for (const lang of Localisation.list.values())
      if (lang.startsWith(query)) return lang

    for (const lang of Localisation.list.values()) {
      if (Localisation.fetch(lang, 'lang_name').toLowerCase().includes(query)) return lang
      if (Localisation.fetch(lang, 'lang_name_en').toLowerCase().includes(query)) return lang
    }
    return ''
  }

  public static getAllLanguages(): { id: string, name: string, nameEn: string, flag: string, ranking: number }[] {
    return [ ...Localisation.list.values() ].map(lang => ({
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
  public static translateObject<T extends Object>(object: T, locale: LocaleContainer | undefined, context: any, maxDepth: number): T {
    if (maxDepth <= 0) return null
    for (const key in object) {
      if (key === '_context') continue
      if (typeof object[key] === 'object') Localisation.translateObject(object[key], locale, context, maxDepth - 1)
      else if (typeof object[key] === 'string') object[key as any] = Localisation.text(locale, object[key as any], context)
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
  public static text(d: LocaleContainer, text: string, context?: { [varname: string]: string }): string {
    let out = (text.startsWith('=')
      ? Localisation.getRaw(Localisation.getLocaleFromContainer(d), text.substring(1), true)
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
  public static renderPriceTag(cont: LocaleContainer, curr: CurrencyDataType | SanitizedCurrencyType, productOrPrice: SanitizedProductType | number) {
    const price = (typeof productOrPrice === 'number')
      ? (productOrPrice as number * 100)
      : productOrPrice.prices.find(p => p.currency === curr?.code)?.oldValue
        ?? productOrPrice.prices.find(p => p.currency === Const.currencyFallback)?.oldValue
        ?? productOrPrice.prices[0]?.oldValue
    return Localisation.getLine(cont, 'currency_sign_position') === 'after'
      ? `${price / 100}${curr?.symbol ?? '€'}`
      : `${curr?.symbol ?? '€'}${price / 100}`
  }

  public static getLocaleFromContainer(cont: LocaleContainer): string {
    if (!cont)
      return Localisation.DEFAULT_LANGUAGE_ID

    if (typeof cont === 'string')
      return Localisation.findClosesLanguageMatchHelper(cont as string)

    if ((cont as SanitizedGuildType).language)
      return (cont as SanitizedGuildType).language

    if ((cont as GenericInteraction).locale)
      return Localisation.findClosestLanguageMatch((cont as GenericInteraction).locale)

    return Localisation.DEFAULT_LANGUAGE_ID
  }

  public static findClosestLanguageMatch(goal: string): string {
    if (!goal) return Localisation.DEFAULT_LANGUAGE_ID
    if (Localisation.closestMatch.has(goal))
      return Localisation.closestMatch.get(goal)

    const actual = this.findClosesLanguageMatchHelper(goal)
    Localisation.closestMatch.set(goal, actual)
    return actual
  }

  private static findClosesLanguageMatchHelper(goal: string): string {
    const [ lang, accent ] = goal.split('-')
    const matching = [ ...Localisation.list.values() ].filter(name => name.startsWith(lang))

    if (!matching.length) return Localisation.DEFAULT_LANGUAGE_ID
    if (matching.length === 1) return matching[0]
    if (!accent) return matching[0]

    const exact = matching.find(name => name.endsWith(accent))
    if (exact) return exact
    return matching[0]
  }

}
