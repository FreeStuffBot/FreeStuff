
export type FreeStuffApiSettings = ({
  type?: 'basic',
} | {
  type: 'partner',
  sid: string,
  version?: string
}) & {
  key: string,
  baseUrl?: string,
  cacheTtl?: {
    gameList?: number,
    gameDetails?: number
  }
}

export enum Endpoint {
  PING = 'GET /ping',
  GAME_LIST = 'GET /games/%s',
  GAME_DETAILS = 'GET /game/%s/%s'
}

export enum PartnerEndpoint {
  STATUS = 'POST /status',
  GAME_ANALYTICS = 'POST /game/%s/analytics',
}

export interface RawApiResponse {
  success: boolean
  error?: string
  message?: string
  data?: Array<any> | Object
  _headers: Object
  _status: number
}

export interface GameInfo {
  id: number;
  url: string
  org_url: string
  title: string
  org_price: {
    euro: number
    dollar: number
  }
  price: {
    euro: number
    dollar: number
  }
  thumbnail: string
  until: Date
  store: Store
  flags: GameFlags
  type: AnnouncementType
  store_meta: {
    steam_subids: string
  }
}

export enum GameFlag {
  TRASH = 1 << 0, // Low quality game
  THIRDPARTY = 1 << 1, // Third party key provider
}

/** @see GameFlag */
export type GameFlags = number

export type Store = 'steam' | 'epic' | 'humble' | 'gog' | 'origin' | 'uplay' | 'twitch' | 'itch' | 'discord' | 'apple' | 'google' | 'switch' | 'ps' | 'xbox' | 'other'

export type AnnouncementType = 'free' | 'weekend' | 'discount' | 'ad' | 'unknown'

export interface GameAnalytics {
  discord: GameAnalyticsDiscord
  telegram: GameAnalyticsTelegram
}

export interface GameAnalyticsDiscord {
  reach: number
  clicks: number
}

export interface GameAnalyticsTelegram {
  reach: {
    users: number
    groups: number
    supergroups: number
    groupUsers: number
    channels: number
    channelUsers: number
  }
  clicks: number
}
