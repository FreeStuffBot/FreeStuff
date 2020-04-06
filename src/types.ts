import { TextChannel, Role } from "discord.js";
import { Long } from "mongodb";

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
