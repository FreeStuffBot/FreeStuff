/* eslint-disable camelcase */
import { MessageEmbed } from 'discord.js'
import { GuildData } from './datastructs'


/*
 * Discord API interactions
 */


export type Interaction = {
  type: number
  token: string
  user?: {
    id: string
    username: string
    avatar: string
    discriminator: string
    public_flags: number
  },
  member?: {
    user: {
      id: string
      username: string
      avatar: string
      discriminator: string
      public_flags: number
    },
    roles: string[]
    premium_since: string | null
    permissions: string
    pending: boolean
    nick: string | null
    mute: boolean
    joined_at: string
    is_pending: boolean
    deaf: boolean
  },
  id: string
  guild_id?: string
  data: {
    options: {
      name: string
      value: string | number
    }[],
    option: { [name: string]: string | number } // custom, parsed
    name: string
    id: string
  },
  channel_id?: string
}


export type InteractionResponseType = 'Pong'
  | 'deprecated-Acknowledge'
  | 'deprecated-ChannelMessage'
  | 'ChannelMessageWithSource'
  | 'DeferredChannelMessageWithSource'


export enum InteractionResponseFlags {
  EPHEMERAL = 64
}

export type InteractionApplicationCommandCallbackData = {
  tts?: boolean,
  content: string,
  flags?: InteractionResponseFlags
  embeds?: Partial<MessageEmbed>[]
  allowed_mentions?: any
}


export type InteractionReplyFunction = (type: InteractionResponseType, data?: (InteractionApplicationCommandCallbackData | Partial<MessageEmbed>) & {context?: any}) => void


export abstract class InteractionCommandHandler {

  public abstract handle(command: Interaction, data: GuildData, reply: InteractionReplyFunction): boolean | Promise<boolean>

}
