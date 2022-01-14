
export enum GameFlag {
  /** Low quality game */
  TRASH = 1 << 0,

  /** Third party key provider */
  THIRDPARTY = 1 << 1,

  /** Permanent monetization model change, only for well known titles */
  PERMANENT = 1 << 2,

  /** Purely cosmetic flag given out by the team for titles that deserve extra attention */
  STAFF_PICK = 1 << 3,
}

/** @see GameFlag */
export type ProductFlags = number


// export type Platform
//   = 'steam'
//   | 'epic'
//   | 'humble'
//   | 'gog'
//   | 'origin'
//   | 'uplay'
//   | 'itch'
//   | 'twitch_prime'
//   | 'apple_appstore'
//   | 'google_play'
//   | 'ps'
//   | 'ps_plus'
//   | 'xbox'
//   | 'xbox_gold'
//   | 'xbox_gamepass'
//   | 'nintendo_eshop'
//   | 'stadia'
//   | 'other'

export type AnnouncementApprovalStatus
  = 'pending'
  | 'declined'
  | 'published'

export type ProductApprovalStatus
  = 'pending' // approval pending
  | 'issues' // system has detected issues
  | 'approved' // product has been approved

export type DiscountType
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

// export type CurrencyName
//   = 'eur'
//   | 'usd'
//   | 'gbp'
//   | 'brl'
//   | 'bgn'
//   | 'pln'
//   | 'huf'
//   | 'btc'

// export type AnnouncementChannel
//   = 'keep' // free to keep games
//   | 'weekend' // free for a weekend games
//   | 'model_change' // payment model changed to something else
//   | 'ps_plus' // free for subscribers
//   | 'twitch_prime' // free for subscribers
//   | 'xbox_gamepass' // free for subscribers
//   | 'stadia' // free for subscribers


/** When the scraper found a game but has not fetched the details yet */
export type ProductSource = {
  platform: string
  url: string
  id: string
}


export type PlatformMeta = {
  steamSubids: string
}


/** Container object for a price */
export type Prices = Record<string, number>


export type Thumbnails = {
  org: string
  blank: string
  full: string
  tags: string
}


export type Urls = {
  default: string
  browser: string
  client?: string
  org: string
}


/**
 * Some analytical data
 */
export type ProductAnalytics = {
  discord: {
    reach: number
  }
}


export type Announcement = {
  /** UNIX Timestamp in seconds - markes the last time the approval status has changed */
  published: number
  /** Current status of the announcement */
  status: AnnouncementApprovalStatus
  /** User id of the moderator, responsible for checking the info and publishing the announcement */
  responsible: string
  /** UNIX Timestamp in second of the last time changes have been made to this announcement */
  changed: string
  /** the products in this announcement */
  items: number[]
  /** the channel to publish this announcement on */
  channel: string
}


/**
 * This is the object that gets stored long term
 */
export type DatabaseProduct = {
  /** a unique number to identify the game - used by the proxy */
  _id: number
  /** internal uuid - used for checking if a game was already announced */
  uuid: string
  /** Current status of the product */
  status: ProductApprovalStatus
  /** User id of the moderator, responsible for checking the info and publishing the announcement */
  responsible: string
  /** UNIX Timestamp in second of the last time changes have been made to this product */
  changed: string
  /** Info about the product */
  data: Product
  /** Analytics */
  analytics: ProductAnalytics
}


/**
 * The object containing all localized information about an announcement
 */
export type LocalizedProductDetails = {
  langName: string
  langNameEn: string
  langFlagEmoji: string
  platform: string
  claimLong: string
  claimShort: string
  free: string
  header: string
  footer: string
  orgPriceEur: string
  orgPriceUsd: string
  until: string
  flags: string[]
}


/**
 * An object with all the data needed to generate all types of announcements
 * For the API post-proccessed version @see OutgoingProduct
 */
 export type Product = {
  /** product's uuid */
  id: number
  /** product's title */
  title: string
  /** old price before the discount */
  oldPrice: Partial<Prices>
  /** new discounted price */
  newPrice: Partial<Prices>
  /** what kind of product is this? */
  kind: ProductKind
  /** tags that further describe the product */
  tags: string[]
  /** thumbnails for the product */
  thumbnails: Thumbnails
  /** a description of the game */
  description: string
  /** rating from 0-1 */
  rating?: number
  /** timestamp of how long this offer is valid */
  until: number
  /** type of discount */
  type: DiscountType
  /** urls to the product */
  urls: Urls
  /** the platform the product is hosted on */
  platform: string
  /** flags */
  flags: ProductFlags
  /** optional notice given out by the team */
  notice?: string
  /** metadata about the game's platform */
  platformMeta: PlatformMeta
  /** wheather this product was manually checked and approved by a staff member */
  staffApproved: boolean
}


/**
 * This is the proccessed version of the GameData object that gets served out by the API.
 * For the data present in the database @see DatabaseProduct
 */
export type OutgoingProduct = {
  localized?: {
    'en-US': LocalizedProductDetails
    [key: string]: LocalizedProductDetails
  }  
}
