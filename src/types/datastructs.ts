import { Long } from 'mongodb'
import { GameAnalytics, GameInfo, Store } from 'freestuff'
import { Role, TextChannel } from 'discord.js'


/*
 * Data structures
 */


export type GameApprovalStatus = 'pending' | 'declined' | 'approved';


/**
 * This is the object that gets stored long term for the following uses:
 * - Tell the proxy where to redirect the links to (redundant as the proxy is not in use yet)
 * - Contain analytics data
 * - Queue up for approval process
 */
export interface GameData {
  /** a unique number to identify the game - used by the proxy */
  _id: number;
  /** internal uuid - used for checking if a game was already announced */
  uuid: string;
  /** UNIX Timestamp in seconds - markes the last time the approval status has changed */
  published: number;
  /** User id of the moderator, responsible for checking the info and publishing the announcement */
  responsible: string;
  /** Current status of the game */
  status: GameApprovalStatus;
  /** Analytical data */
  analytics: GameAnalytics;
  /** Info about the game */
  info: GameInfo;
}


/** The data that gets stored in the database */
export interface DatabaseGuildData {
  _id: Long;
  sharder: Long;
  channel: Long | null;
  role: Long | null;
  settings: number;
  price: number;
}


/** After the data is parsed to allow easier access */
export interface GuildData extends DatabaseGuildData {
  channelInstance: TextChannel;
  roleInstance: Role;
  theme: number;
  currency: 'euro' | 'usd';
  react: boolean;
  trashGames: boolean;
  altDateFormat: boolean;
  language: string;
  storesRaw: number;
  storesList: Store[];
  beta: boolean;
}
