/* eslint-disable camelcase */


/*
 * Discord API interactions
//  */

// export type InteractionReplyActionEvent = {
//   custom_id: string
// } & ({
//   component_type: 2
// } | {
//   component_type: 3
//   values: string[]
// })

// export type InteractionUser = {
//   id: string
//   username: string
//   avatar: string
//   discriminator: string
//   public_flags: number
//   bot: boolean
// }

// export type InteractionMessage = {
//   webhook_id?: string,
//   type: number,
//   tts: boolean,
//   timestamp: string,
//   pinned: boolean,
//   mentions: any[], // TODO
//   mention_roles: any[], // TODO
//   mention_everyone: boolean,
//   interaction?: {
//     user: InteractionUser,
//     type: number,
//     name: string,
//     id: string
//   },
//   id: string,
//   flags: number,
//   embeds: any[], // TODO
//   edited_timestamp: string | null,
//   content: string,
//   components: any, // TODO
//   channel_id: string,
//   author: InteractionUser,
//   attachments: any[], // TODO
//   application_id: string
// }

// export type InteractionMember = {
//   user: InteractionUser
//   roles: string[]
//   premium_since: string | null
//   permissions: string
//   pending: boolean
//   nick: string | null
//   mute: boolean
//   joined_at: string
//   is_pending: boolean
//   deaf: boolean
// }

// export type InteractionLocationGuild = {
//   member: InteractionMember
//   user?: undefined
//   guild_id: string
//   channel_id: string
// }

// export type InteractionLocationDM = {
//   member?: undefined
//   user: InteractionUser
//   guild_id?: undefined
//   channel_id?: undefined
// }

// export type InteractionTypeCommand = {
//   type: 2
//   message?: undefined
//   data: {
//     id?: string
//     name?: string
//     options?: {
//       name: string
//       value: string | number
//     }[],
//     option?: { [name: string]: string | number } // custom, parsed
//   }
// }

// export type InteractionTypeComponent = {
//   type: 3
//   message: InteractionMessage
//   data: InteractionReplyActionEvent
// }

// export type InteractionBase = {
//   id: string
//   token: string
//   application_id?: string
// }

// //

// export type GenericInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & (InteractionTypeCommand | InteractionTypeComponent)
// export type CommandInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeCommand
// export type ComponentInteraction = InteractionBase & (InteractionLocationGuild | InteractionLocationDM) & InteractionTypeComponent

//


// export type InteractionResponseType = 'Pong'
//   | 'deprecated-Acknowledge'
//   | 'deprecated-ChannelMessage'
//   | 'ChannelMessageWithSource'
//   | 'DeferredChannelMessageWithSource'
//   | 'DeferredUpdateMessage'
//   | 'UpdateMessage'

// export enum InteractionResponseFlags {
//   EPHEMERAL = 64
// }


// export type MessageComponentButton = {
//   type: 2
//   label?: string
//   emoji?: Partial<InteractionEmoji>
//   disabled?: boolean
// } & ({
//   style: 1 | 2 | 3 | 4
//   custom_id: string
// } | {
//   style: 5
//   url: string
// })

// export type MessageComponentSelectOption = {
//   label: string
//   value: string
//   description?: string
//   emoji?: Partial<InteractionEmoji>
//   default?: boolean
// }

// export type MessageComponentSelectMenu = {
//   type: 3
//   custom_id: string
//   options: MessageComponentSelectOption[]
//   placeholder?: string
//   min_values?: number
//   max_values?: number
//   disabled?: boolean
// }

// export type MessageComponent = MessageComponentButton | MessageComponentSelectMenu

// export type ActionRow = {
//   type: 1
//   components: MessageComponent[]
// }

// export type LocalisationContext = {
//   [key: string]: string
// }

// export type InteractionApplicationCommandCallbackData = {
//   tts?: boolean
//   content?: string
//   flags?: InteractionResponseFlags
//   embeds?: Partial<MessageEmbed>[]
//   allowed_mentions?: any
//   components?: ActionRow[]

//   description?: string
//   title?: string
//   footer?: string
//   image?: string
//   color?: number
//   _context?: LocalisationContext
// }

//

// export type InteractionEditFunction = (data?: InteractionApplicationCommandCallbackData) => void

// export type InteractionComponentHandler = (event: InteractionReplyActionEvent, edit: InteractionEditFunction) => any

// export type InteractionReplyContext = {
//   id: string
//   interaction: GenericInteraction
//   guildData: GuildData
//   timeout: number
//   timeoutRunFunc: (...any: any) => any
//   timeoutRunner: NodeJS.Timeout
//   resetTimeoutOnInteraction: boolean
//   handlers: { [customId: number]: InteractionComponentHandler }
// }

// export type InteractionReplyStateLevelThree = {
//   _context: InteractionReplyContext,
//   on(customId: string, handler: InteractionComponentHandler): InteractionReplyStateLevelThree
// }

// export type InteractionReplyStateLevelTwo = {
//   _context: InteractionReplyContext,
//   withTimeout(millis: number, resetOnInteraction: boolean, janitor: (edit: InteractionEditFunction) => any): InteractionReplyStateLevelThree
// }

// export type InteractionReplyFunction = (type: InteractionResponseType, data?: InteractionApplicationCommandCallbackData) => InteractionReplyStateLevelTwo

//

// export abstract class InteractionCommandHandler {

//   public abstract handle(command: CommandInteraction, data: GuildData, reply: InteractionReplyFunction): boolean | Promise<boolean>

// }


//


// export enum InteractionType {
//   COMMAND = 2,
//   COMPONENT = 3
// }

// export enum ComponentType {
//   ROW = 1,
//   BUTTON = 2,
//   SELECT = 3
// }

// export enum ButtonStyle {
//   PRIMARY = 1,
//   SECONDARY = 2,
//   SUCCESS = 3,
//   DANGER = 4,
//   LINK = 5
// }
