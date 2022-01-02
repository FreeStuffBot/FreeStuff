import { GuildData } from '@freestuffbot/typings'
import { Message } from 'discord.js'


/*
 * Commands and associated types
 */


/** @deprecated */
export interface CommandInfo {
  name: string
  desc: string
  trigger: string[]
  adminOnly?: boolean
  serverManagerOnly?: boolean
  hideOnHelp?: boolean
}


/** @deprecated */
export type ReplyFunction = (message: string, content: string, footer?: string, color?: number, image?: string) => void


/** @deprecated */
export interface CommandHandler {
  handle(mes: Message, args: string[], data: GuildData, reply: ReplyFunction): boolean | Promise<boolean>
}


/** @deprecated */
export abstract class Command implements CommandHandler {

  public constructor(
    public readonly info: CommandInfo
  ) {
    if (info.adminOnly === undefined) info.adminOnly = false
    if (info.serverManagerOnly === undefined) info.serverManagerOnly = false
    if (info.hideOnHelp === undefined) info.hideOnHelp = false
  }

  public abstract handle(mes: Message, args: string[], data: GuildData, repl: ReplyFunction): boolean | Promise<boolean>

}


/** @deprecated */
export interface SettingsSubcommand {
  /** [ usage, description, description variables ] */
  getMetaInfo(g: GuildData): [ string, string, any? ] | ([ string, string, any? ])[]
}
