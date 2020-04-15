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
  clicks: {
    total: number; // In total
    guilds: {
      [guildId: string]: number; // per guild
    };
  };
  info: GameInfo; // Info about the game

}

/** When the scraper found a game but has not fetched the details yet */
export interface GameSource {

  store: Store;
  url: string;
  id: string;

}

export interface GameInfo {

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
  org_url: string; // The direct link to the store page
  store: Store; // Game's store
  trash: boolean; // Weather the game is flaged as trash or not
  type: AnnouncementType; // Type of annoucement
  steamSubids: string; // Empty if not from steam
  url: string; // Proxied url

}

export interface GuildData {

  id: string;
  channel: string;
  channelInstance: TextChannel;
  mentionRole: string;
  mentionRoleInstance: Role;
  settings: number;
  theme: number;
  currency: 'euro' | 'usd';
  react: boolean;
  trashGames: boolean;
  price: number;

}

export type GuildSetting = 'channel' | 'roleMention' | 'theme' | 'currency' | 'react' | 'trash' | 'price';

export type Store = 'steam' | 'epic' | 'humble' | 'gog' | 'origin' | 'uplay' | 'twitch' | 'itch' | 'discord' | 'apple' | 'google' | 'switch' | 'other';

export type GameApprovalStatus = 'pending' | 'declined' | 'accepted' | 'published';

export type AnnouncementType = 'free' | 'discount' | 'ad' | 'unknown';


/*
 * CODE STRUCTURES
 */

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
