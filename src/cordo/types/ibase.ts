/* eslint-disable camelcase */
// INTERACTION BASE TYPES

import { GuildData } from 'types/datastructs'
import { InteractionApplicationCommandCallbackData, InteractionReplyStateLevelTwo } from './custom'
import { ComponentType, InteractionComponentFlag, InteractionType } from './iconst'


export type InteractionUser = {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
  bot: boolean
}

export type InteractionMember = {
  user: InteractionUser
  roles: string[]
  premium_since: string | null
  permissions: string
  pending: boolean
  nick: string | null
  mute: boolean
  joined_at: string
  is_pending: boolean
  deaf: boolean
}

export type InteractionMessage = {
  webhook_id?: string,
  type: number,
  tts: boolean,
  timestamp: string,
  pinned: boolean,
  mentions: any[], // TODO
  mention_roles: any[], // TODO
  mention_everyone: boolean,
  interaction?: {
    user: InteractionUser,
    type: number,
    name: string,
    id: string
  },
  id: string,
  flags: number,
  embeds: any[], // TODO
  edited_timestamp: string | null,
  content: string,
  components: any, // TODO
  channel_id: string,
  author: InteractionUser,
  attachments: any[], // TODO
  application_id: string
}

export type InteractionEmoji = {
  id: string
  name: string
  animated: boolean
}

//

export type InteractionLocationGuild = {
  member: InteractionMember
  user?: undefined
  guild_id: string
  channel_id: string
}

export type InteractionLocationDM = {
  member?: undefined
  user: InteractionUser
  guild_id?: undefined
  channel_id?: undefined
}

//

export type InteractionTypeCommand = {
  type: InteractionType.COMMAND
  message?: undefined
  data: {
    id?: string
    name?: string
    custom_id?: string
    options?: {
      name: string
      value: string | number
    }[],
    option?: { [name: string]: string | number } // custom, parsed
  }
}

export type InteractionTypeComponent = {
  type: InteractionType.COMPONENT
  message: InteractionMessage
  data: {
    commponent_type: ComponentType.BUTTON | ComponentType.SELECT
    custom_id: string
    values?: string[]
    flags: InteractionComponentFlag[]
  }
}

//

export type InteractionBase = {
  id: string
  token: string
  version: number
  application_id?: string
  guildData?: GuildData
  _answered: boolean
}

//

export type GenericInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & (InteractionTypeCommand | InteractionTypeComponent)
export type CommandInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeCommand
export type ComponentInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeComponent

export type ReplyableCommandInteraction = CommandInteraction & {
  reply(data: InteractionApplicationCommandCallbackData): void
  replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo
  replyPrivately(data: InteractionApplicationCommandCallbackData): void
  state(state?: string, ...args: any): void
}

export type ReplyableComponentInteraction = ComponentInteraction & {
  ack(): void
  reply(data: InteractionApplicationCommandCallbackData): void
  replyInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo
  replyPrivately(data: InteractionApplicationCommandCallbackData): void
  edit(data: InteractionApplicationCommandCallbackData): void
  editInteractive(data: InteractionApplicationCommandCallbackData): InteractionReplyStateLevelTwo
  // disableComponents(): void
  removeComponents(): void
  state(state?: string, ...args: any): void
}

export type InteractionJanitor = {
  edit(data: InteractionApplicationCommandCallbackData): void
  // disableComponents(): void
  removeComponents(): void
  state(state?: string, ...args: any): void
}
