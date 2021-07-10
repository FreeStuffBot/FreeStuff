import { GuildData } from '../types/datastructs'
import Database from '../database/database'
import { Core } from '../index'


export default class LanguageManager {

  private static list = [];
  private static idmap = {};
  private static texts = {};

  public static init() {
    LanguageManager.load()

    setInterval(() => LanguageManager.load(), 1000 * 60 * 60 * 24)
  }

  public static async load() {
    LanguageManager.list = []
    LanguageManager.idmap = {}
    LanguageManager.texts = {}

    let all = await Database
      .collection('language')
      ?.find({ _enabled: true })
      // .sort({ _ranking: -1 })
      .sort({ _id: 1 })
      .toArray()

    all = all.sort((a, b) => a._id.startsWith('en') ? -1 : b._id.startsWith('en') ? 1 : 0)

    for (const lang of all) {
      for (const key in lang) {
        if (key.startsWith('_')) continue
        lang[key] = lang[key].split('\\n').join('\n')
      }

      LanguageManager.list.push(lang._id)
      LanguageManager.idmap[lang._index] = lang._id
      LanguageManager.texts[lang._id] = lang
    }
  }

  public static get(d: GuildData, key: string): string {
    return LanguageManager.getRaw(d.language, key, true)
  }

  public static getRaw(language: string, key: string, fallback = true): string {
    if (!LanguageManager.list.length) return key
    if (!fallback) return LanguageManager.getText(language, key)
    if (!language || !LanguageManager.texts[language]) return LanguageManager.getText(LanguageManager.idmap[0], key)
    return LanguageManager.getText(language, key) || LanguageManager.getText(LanguageManager.idmap[0], key) || key
  }

  private static getText(language: string, key: string): string {
    return LanguageManager.texts[language]?.[key]
  }

  public static languageById(id: number | string): string {
    return LanguageManager.idmap[id + ''] || LanguageManager.idmap[0]
  }

  public static languageToId(lang: string): number {
    for (const key in LanguageManager.idmap) {
      if (LanguageManager.idmap[key] === lang)
        return parseInt(key, 10)
    }
    return -1
  }

  public static languageByName(query: string): string {
    query = query.toLowerCase()
    for (const lang of LanguageManager.list) {
      if (LanguageManager.getText(lang, 'lang_name').toLowerCase() === query) return lang
      if (LanguageManager.getText(lang, 'lang_name_en').toLowerCase() === query) return lang
    }
    for (const lang of LanguageManager.list)
      if (lang.startsWith(query)) return lang

    for (const lang of LanguageManager.list) {
      if (LanguageManager.getText(lang, 'lang_name').toLowerCase().includes(query)) return lang
      if (LanguageManager.getText(lang, 'lang_name_en').toLowerCase().includes(query)) return lang
    }
    return ''
  }

  public static displayLangList(includeFlagEmojis: boolean): string[] {
    const out: string[] = []
    LanguageManager.list.forEach((lang, i) => {
      out.push(`${includeFlagEmojis ? (LanguageManager.getText(lang, 'lang_flag_emoji') + ' ') : ''}**${LanguageManager.getText(lang, 'lang_name')}** (${LanguageManager.getText(lang, 'lang_name_en')})`)
      if (i === 1) out.push('')
    })
    return out
  }

  /**
   * Recursively traverses the given object until maxDepth, translating every string value found
   */
  public static translateObject(object: any, guildData: GuildData | undefined, context: any, maxDepth: number) {
    if (maxDepth <= 0) return
    for (const key in object) {
      if (key === 'context') continue
      if (typeof object[key] === 'object') LanguageManager.translateObject(object[key], guildData, context, maxDepth--)
      else if (typeof object[key] === 'string') object[key] = Core.text(guildData, object[key], context)
    }
  }

}
