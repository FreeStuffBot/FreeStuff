import { TextChannel, Role } from "discord.js";

export interface FreeStuffData {

  title: string;
  url: string;
  org_price: {
    euro: number;
    dollar: number;
  };
  store: string;
  thumbnail: string;

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

}

export type GuildSetting = 'channel' | 'roleMention' | 'theme' | 'currency' | 'react';
