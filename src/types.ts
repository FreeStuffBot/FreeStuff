import { TextChannel, Role, Message } from "discord.js";
import { Long } from "mongodb";



/*
 * DATA STRUCTURES
 */

export interface FreeStuffData {

  title: string;
  url: string;
  org_price: {
    euro: number;
    dollar: number;
  };
  store: string;
  thumbnail: string;
  trash: boolean;

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

export interface GameMeta {

  id: string;
  store: Store;
  found: Long;
  status: GameApprovalStatus;
  data: FreeStuffData;

}

export type GuildSetting = 'channel' | 'roleMention' | 'theme' | 'currency' | 'react' | 'trash' | 'price';

export type Store = 'steam' | 'epic' | 'humble' | 'gog' | 'origin' | 'uplay' | 'twitch' | 'itch' | 'discord' | 'apple' | 'google' | 'other';

export type GameApprovalStatus = 'pending' | 'declined' | 'accepted';


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
