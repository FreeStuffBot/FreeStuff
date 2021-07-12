import { Core } from '../index'
import { GuildData } from '../types/datastructs'


export default class Tracker {

  public static readonly TRACKING_POINT = {
    PAGE_DISCOVERED_SETTINGS_MAIN: 1 << 0,
    PAGE_DISCOVERED_SETTINGS_CHANGE_CHANNEL: 1 << 1,
    PAGE_DISCOVERED_SETTINGS_CHANGE_LANGUAGE: 1 << 2,
    PAGE_DISCOVERED_SETTINGS_CHANGE_ROLE: 1 << 3,
    PAGE_DISCOVERED_SETTINGS_CHANGE_DISPLAY: 1 << 4,
    PAGE_DISCOVERED_SETTINGS_CHANGE_FILTER: 1 << 5,
    PAGE_DISCOVERED_SETTINGS_CHANGE_MORE: 1 << 6,
    PAGE_DISCOVERED_FREE_GAMES_LIST: 1 << 7,
    ACTION_DATA_REQUESTED: 1 << 6,
    NEWS_FEED_SLOT_A: 1 << 24,
    NEWS_FEED_SLOT_B: 1 << 25,
    NEWS_FEED_SLOT_C: 1 << 26,
    NEWS_FEED_SLOT_D: 1 << 27,
    NEWS_FEED_SLOT_E: 1 << 28,
    NEWS_FEED_SLOT_F: 1 << 29,
    NEWS_FEED_SLOT_G: 1 << 30
  }

  public static showHint(g: GuildData, hint: keyof typeof Tracker.TRACKING_POINT): boolean {
    return !this.isTracked(g, hint)
  }

  public static isTracked(g: GuildData, hint: keyof typeof Tracker.TRACKING_POINT): boolean {
    return g && (g.tracker & Tracker.TRACKING_POINT[hint]) !== 0
  }

  public static set(g: GuildData, hint: keyof typeof Tracker.TRACKING_POINT, value = true) {
    const state = this.isTracked(g, hint)
    if (state === value) return // no change
    Core.databaseManager?.changeSetting(g, 'tracker', g.tracker ^ Tracker.TRACKING_POINT[hint])
  }

}
