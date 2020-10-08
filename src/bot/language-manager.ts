import { FreeStuffBot } from "../index";
import { GuildData } from "types";
import Database from "../database/database";


export default class LanguageManager {

  private list = [];
  private idmap = {};
  private texts = {};

  public constructor(bot: FreeStuffBot) {
    this.load();

    setInterval(() => this.load(), 1000 * 60 * 60 * 24);
  }

  public async load() {
    this.list = [];
    this.idmap = {};
    this.texts = {};

    const all = await Database
      .collection('language')
      .find({ _enabled: true })
      .sort({ _ranking: -1 })
      .toArray();

    for (const lang of all) {
      for (const key in lang) {
        if (key.startsWith('_')) continue;
        lang[key] = lang[key].split('\\n').join('\n');
      }

      this.list.push(lang._id);
      this.idmap[lang._index] = lang._id;
      this.texts[lang._id] = lang;
    }
  }

  public get(d: GuildData, key: string): string {
    return this.getRaw(d.language, key, true);
  }

  public getRaw(language: string, key: string, fallback = true): string {
    if (!this.list.length) return key;
    if (!fallback) return this.getText(language, key);
    if (!this.texts[language]) return this.getText(this.list[0], key);
    return this.getText(language, key) || this.getText(this.list[0], key) || key;
  }

  private getText(language: string, key: string): string {
    return this.texts[language] && this.texts[language][key];
  }

  public languageById(id: number | string): string {
    return this.idmap[id + ''] || this.list[0];
  }

  public languageToId(lang: string): number {
    for (const key in this.idmap) {
      if (this.idmap[key] == lang)
        return parseInt(key, 10);
    }
    return -1;
  }

  public languageByName(query: string): string {
    query = query.toLowerCase();
    for (const lang of this.list) {
      if (this.getText(lang, 'lang_name').toLowerCase() == query) return lang;
      if (this.getText(lang, 'lang_name_en').toLowerCase() == query) return lang;
    }
    for (const lang of this.list) {
      if (lang.startsWith(query)) return lang;
    }
    for (const lang of this.list) {
      if (this.getText(lang, 'lang_name').toLowerCase().includes(query)) return lang;
      if (this.getText(lang, 'lang_name_en').toLowerCase().includes(query)) return lang;
    }
    return '';
  }

  public displayLangList(includeFlagEmojis: boolean): string[] {
    const out: string[] = [];
    for (const lang of this.list)
      out.push(`${includeFlagEmojis ? (this.getText(lang, 'lang_flag_emoji') + ' ') : ''}**${this.getText(lang, 'lang_name')}** (${this.getText(lang, 'lang_name_en')})`);
    return out;
  }

}