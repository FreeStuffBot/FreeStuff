import { Long } from 'mongodb'
import { GameAnalytics, GameInfo } from 'freestuff'
import { Role, TextChannel } from 'discord.js'
import { Currency, Platform, PriceClass, Theme } from './context'


/*
 * Data structures
 */


export type GameApprovalStatus = 'pending' | 'declined' | 'approved'


/**
 * This is the object that gets stored long term for the following uses:
 * - Tell the proxy where to redirect the links to (redundant as the proxy is not in use yet)
 * - Contain analytics data
 * - Queue up for approval process
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
  /** Analytical data */
  analytics: GameAnalytics
  /** Info about the game */
  info: GameInfo
}


/** The data that gets stored in the database */
export interface DatabaseGuildData {
  _id: Long
  sharder: Long
  channel: Long | null
  role: Long | null
  settings: number
  filter: number
  tracker: number
}


/**
 * After the data is parsed to allow easier access
 * @usage While this object might get updated once data changes, it is NOT guaranteed to. Treat it as a copy of the data at a specific time, not as an interface to the guild. => No caching this data manually in commands or components, no storing it for longer than needed
 */
export interface GuildData extends DatabaseGuildData {
  channelInstance: TextChannel
  roleInstance: Role
  theme: Theme
  currency: Currency
  price: PriceClass
  react: boolean
  trashGames: boolean
  language: string
  platformsRaw: number
  platformsList: Platform[]
  beta: boolean
}
