import { TextChannel, Role, Message } from "discord.js";
import { Long } from "mongodb";



/*
 * DATA STRUCTURES
 */

/** This is the object that gets stored long term for the following uses:
 * - Tell the proxy where to redirect the links to
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
    reach: number; // Number of servers it got announced in
    clicks: number; // Clicks in total
    guilds: {
      [guildId: string]: number; // Clicks per guild
    };
  };
  info: GameInfo; // Info about the game
  outgoing?: number[]; // Array that gradually fills up with all the shards that have picked up the announcement. Last shard that would make the list full, will remove the object from the entry

}

/** When the scraper found a game but has not fetched the details yet */
export interface GameSource {

  store: Store;
  url: string;
  id: string;

}

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
  until: number; // How many days the offer is valid
  steamSubids?: string; // For steam games, subids with a space between, for other stores just an empty string

}

/** An object with all the data needed to generate all types of announcements */
export interface GameInfo extends ScrapeableGameInfo {

  url: string; // Proxy url
  org_url: string; // The direct link to the store page
  store: Store; // Game's store
  flags: GameFlag[]; // Flags
  type: AnnouncementType; // Type of annoucement
  steamSubids: string; // Now required

}

export enum GameFlag {
  TRASH = 'TRASH',
  THIRDPARTY = 'THIRDPARTY',
}

/** The data that gets stored in the database */
export interface DatabaseGuildData {

  _id: Long;
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

}

export type GuildSetting = 'channel' | 'roleMention' | 'theme' | 'currency' | 'react' | 'trash' | 'price';

export type Store = 'steam' | 'epic' | 'humble' | 'gog' | 'origin' | 'uplay' | 'twitch' | 'itch' | 'discord' | 'apple' | 'google' | 'switch' | 'ps' | 'xbox' | 'other';

export type GameApprovalStatus = 'pending' | 'declined' | 'accepted' | 'published' | 'scheduled';

export type AnnouncementType = 'free' | 'weekend' | 'discount' | 'ad' | 'unknown';


/*
 * CODE STRUCTURES
 */

export interface Shard {

  id: number;
  server: string;
  status: 'ok' | 'timeout' | 'offline' | 'crashed';
  lastHeatbeat: number;
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

export abstract class Command {

  public constructor(
    public readonly info: CommandInfo
  ) {
    if (info.adminOnly === undefined) info.adminOnly = false;
    if (info.serverManagerOnly === undefined) info.serverManagerOnly = false;
    if (info.hideOnHelp === undefined) info.hideOnHelp = false;
  }
  
  public abstract handle(mes: Message, args: string[], repl: ReplyFunction): boolean | Promise<boolean>;
  
}

export type ReplyFunction = (message: string, content: string, footer?: string, color?: number, image?: string) => void;


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
