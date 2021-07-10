/* eslint-disable camelcase */

import { MessageEmbed } from 'discord.js'
import { GuildData } from 'types/datastructs'
import { GenericInteraction, ReplyableCommandInteraction, ReplyableComponentInteraction } from './ibase'
import { MessageComponent } from './icomponent'
import { InteractionResponseFlags } from './iconst'


// Other

export type LocalisationContext = {
  [key: string]: string
}

export type HandlerSuccess = boolean | Promise<boolean>

// Interesting

export type InteractionApplicationCommandCallbackData = {
  tts?: boolean
  content?: string
  flags?: InteractionResponseFlags
  embeds?: Partial<MessageEmbed>[]
  allowed_mentions?: any
  components?: MessageComponent[]

  description?: string
  title?: string
  footer?: string
  image?: string
  color?: number
  _context?: LocalisationContext
}

// Handler

export type InteractionCommandHandler
  = (i: ReplyableCommandInteraction, data: GuildData)
  => HandlerSuccess

export type InteractionComponentHandler
  = (i: ReplyableComponentInteraction, data: GuildData)
  => HandlerSuccess

// Reply flow

export type InteractionReplyContext = {
  id: string
  interaction: GenericInteraction
  guildData: GuildData
  timeout: number
  timeoutRunFunc: (...any: any) => any
  timeoutRunner: NodeJS.Timeout
  resetTimeoutOnInteraction: boolean
  handlers: { [customId: string]: InteractionComponentHandler }
}

export type InteractionReplyStateLevelThree = {
  _context: InteractionReplyContext,
  on(customId: string, handler: InteractionComponentHandler): InteractionReplyStateLevelThree
}

export type InteractionReplyStateLevelTwo = {
  _context: InteractionReplyContext,
  withTimeout(millis: number, resetOnInteraction: boolean, janitor: (edit: ReplyableComponentInteraction) => any): InteractionReplyStateLevelThree
}

