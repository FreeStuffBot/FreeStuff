
export enum GameFlag {
  TRASH = 1 << 0, // Low quality game
  THIRDPARTY = 1 << 1, // Third party key provider
}

/** @see GameFlag */
export type GameFlags = number


export type Store
  = 'steam'
  | 'epic'
  | 'humble'
  | 'gog'
  | 'origin'
  | 'uplay'
  | 'twitch'
  | 'itch'
  | 'discord'
  | 'apple'
  | 'google'
  | 'switch'
  | 'ps'
  | 'xbox'
  | 'other'

export type GameApprovalStatus
  = 'pending'
  | 'declined'
  | 'approved'

export type AnnouncementType
  = 'free'
  | 'weekend'
  | 'discount'
  | 'ad'
  | 'unknown'

export type ProductKind
  = 'game'
  | 'dlc'
  | 'software'
  | 'art'
  | 'ost'
  | 'book'
  | 'other'


/** When the scraper found a game but has not fetched the details yet */
export interface GameSource {
  store: Store
  url: string
  id: string
}


/** The data that can be found by the web scrapers */
export interface ScrapeableGameInfo {
  title: string // Game's title
  org_price: { // Price before the discount
    euro: number
    usd: number
  }
  price: { // Price after the discount
    euro: number
    usd: number
  }
  kind: ProductKind
  tags: string[]
  thumbnail: string // Url to the thumbnail image
  description: string
  rating?: number // from 0 - 1
  until: number // UNIX Timestamp in seconds of when the sale is going to end
  type?: AnnouncementType // Type of annoucement
  store_meta?: {
    steam_subids?: string // For steam games, subids with a space between, for other stores just an empty string
  }
}


/**
 * An object with all the data needed to generate all types of announcements
 * For the API post-proccessed version @see GameInfo
 */
export interface DatabaseGameInfo extends ScrapeableGameInfo {
  org_url: string // The direct link to the store page
  store: Store // Game's store
  flags: GameFlags // Flags
  type: AnnouncementType // Type of annoucement
  notice?: string
  store_meta: {
    steam_subids: string
  } // Now required
  proxy_url?: string // Firebase proxy url
}


/**
 * Some analytical data
 */
export interface GameAnalytics {
  discord: {
    reach: number
  }
}


/**
 * This is the object that gets stored long term
 */
export interface GameData {
  /** a unique number to identify the game - used by the proxy */
  _id: number
  /** internal uuid - used for checking if a game was already announced */
  uuid: string
  /** UNIX Timestamp in seconds - markes the last time the approval status has changed */
  published: number
  /** User id of the moderator, responsible for checking the info and publishing the announcement */
  responsible: string
  /** Current status of the game */
  status: GameApprovalStatus
  /** Info about the game */
  info: DatabaseGameInfo
  /** Analytics */
  analytics: GameAnalytics
}


/**
 * The object containing all localized information about an announcement
 */
export interface LocalizedGameInfo {
  lang_name: string,
  lang_name_en: string,
  lang_flag_emoji: string,
  platform: string,
  claim_long: string,
  claim_short: string,
  free: string,
  header: string,
  footer: string,
  org_price_eur: string,
  org_price_usd: string,
  until: string,
  until_alt: string,
  flags: string[]
}


/**
 * This is the post-proccessed version of the GameInfo object that gets served out by the API.
 * For the data present in the database @see DatabaseGameInfo
 */
export interface GameInfo {
  id: number
  urls: {
    default: string,
    browser: string,
    client?: string,
    org: string
  }
  title: string
  org_price: {
    euro: number
    usd: number
    gbp: number
    brl: number
    bgn: number
    pln: number
    huf: number
    btc: number
  }
  price: {
    euro: number
    usd: number
    gbp: number
    brl: number
    bgn: number
    pln: number
    huf: number
    btc: number
  }
  thumbnail: {
    org: string
    blank: string
    full: string
    tags: string
  }
  kind: ProductKind
  tags: string[]
  description: string
  rating?: number
  notice?: string
  until: Date
  store: Store
  flags: GameFlags
  type: AnnouncementType
  store_meta: {
    steam_subids: string
  },
  localized?: {
    'en-US': LocalizedGameInfo
    [key: string]: LocalizedGameInfo
  }
}
