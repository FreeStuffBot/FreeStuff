import { TextChannel, Role, Message, MessageOptions } from "discord.js";
import { Long } from "mongodb";



/*
 * DATA STRUCTURES
 */

/** This is the object that gets stored long term for the following uses:
 * - Tell the proxy where to redirect the links to (redundant as the proxy is not in use yet)
 * - Contain analytics data
 * - Queue up for approval process
 */
export interface GameData {

  _id: number; // a unique number to identify the game - used by the proxy
  uuid: string; // internal uuid - used for checking if a game was already announced
  published: number; // UNIX Timestamp in seconds - markes the last time the approval status has changed
  responsible: string; // User id of the moderator, responsible for checking the info and publishing the announcement
  status: GameApprovalStatus; // Current status of the game
  analytics: {
    discord: {
      reach: number; // Number of servers it got announced in
      clicks: number; // Clicks in total
    };
    telegram: {
      reach: {
        users: 0; // Private messages to specific users.
        groups: 0; // Supergroups excluded
        supergroups: 0; // Public groups with huge number of users.
        groupUsers: 0; // A sum of the users count in all the groups.
        channels: 0;
        channelUsers: 0; // The sum of subscribed users count in all the channels.
      };
      clicks: number; // Clicks in total
    };
  };
  info: GameInfo; // Info about the game
  outgoing: {
    discord?: number[]; // Array that gradually fills up with all the shards that have picked up the announcement. Last shard that would make the list full will remove the object from the entry
    telegram?: boolean; // Queued up. True if needs to be announced. Never false. Gets removed when one.
  }

}

/** When the scraper found a game but has not fetched the details yet */
export interface GameSource {

  store: Store;
  url: string;
  id: string;

}

/** The data that can be found by the web scrapers */
export interface ScrapeableGameInfo {

  title: string; // Game's title
  org_price: { // Price before the discount
    euro: number;
    dollar: number;
  };
  price: { // Price after the discount
    euro: number;
    dollar: number;
  };
  thumbnail: string; // Url to the thumbnail image
  until: number; // UNIX Timestamp in seconds of when the sale is going to end
  steamSubids?: string; // For steam games, subids with a space between, for other stores just an empty string

}

/** An object with all the data needed to generate all types of announcements */
export interface GameInfo extends ScrapeableGameInfo {

  url: string; // Proxy url
  org_url: string; // The direct link to the store page
  store: Store; // Game's store
  flags: GameFlags; // Flags
  type: AnnouncementType; // Type of annoucement
  steamSubids: string; // Now required

}

export enum GameFlag {
  TRASH = 1 << 0, // Low quality game
  THIRDPARTY = 1 << 1, // Third party key provider
}

/** @see GameFlag */
export type GameFlags = number;

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

}

export type GuildSetting = 'channel' | 'roleMention' | 'theme' | 'currency' | 'react' | 'trash' | 'price' | 'altdate' | 'language' | 'stores';

export type Store = 'steam' | 'epic' | 'humble' | 'gog' | 'origin' | 'uplay' | 'twitch' | 'itch' | 'discord' | 'apple' | 'google' | 'switch' | 'ps' | 'xbox' | 'other';

export type GameApprovalStatus = 'pending' | 'declined' | 'approved';

export type AnnouncementType = 'free' | 'weekend' | 'discount' | 'ad' | 'unknown';


export enum FilterableStore {
  OTHER  = 1 << 0,
  STEAM  = 1 << 1,
  EPIC   = 1 << 2,
  HUMBLE = 1 << 3,
  GOG    = 1 << 4,
  ORIGIN = 1 << 5,
  UPLAY  = 1 << 6,
  ITCH   = 1 << 7,
}


/*
 * CODE STRUCTURES
 */

export interface Shard {

  id: number;
  server: string;
  status: 'ok' | 'timeout' | 'offline' | 'crashed';
  lastHeartbeat: number;
  guildCount: number;

}

export interface ShardStatusPayload extends Shard {

  totalShardCount: number;

}

export interface CommandInfo {

  name: string;
  desc: string;
  trigger: string[];
  adminOnly?: boolean;
  serverManagerOnly?: boolean;
  hideOnHelp?: boolean;

}

export interface CommandHandler {

  handle(mes: Message, args: string[], data: GuildData, reply: ReplyFunction): boolean | Promise<boolean>;

}

export abstract class Command implements CommandHandler {

  public constructor(
    public readonly info: CommandInfo
  ) {
    if (info.adminOnly === undefined) info.adminOnly = false;
    if (info.serverManagerOnly === undefined) info.serverManagerOnly = false;
    if (info.hideOnHelp === undefined) info.hideOnHelp = false;
  }
  
  public abstract handle(mes: Message, args: string[], data: GuildData, repl: ReplyFunction): boolean | Promise<boolean>;
  
}

export interface SettingsSubcommand {

  /** [ usage, description, description variables ] */
  getMetaInfo(g: GuildData): [ string, string, any? ] | ([ string, string, any? ])[];

}

export type ReplyFunction = (message: string, content: string, footer?: string, color?: number, image?: string) => void;

export interface Theme {

  build(content: GameInfo, data: GuildData, test: boolean): [string, MessageOptions];

}

export interface StoreData {

  name: string;
  key: Store;
  icon: string;
  bit: number;

}


/*
 * PROTOTYPE OVERRIDES
 */

declare global {
  interface Array<T> {
    stack(): number;
    count(counter: (item: T) => number): number;
    iterate(run: (item: T, current: T | undefined) => any): any;
  }
}
