import { Message } from 'discord.js'
import { GuildData } from '../../../types/datastructs'
import { ReplyFunction, CommandHandler, SettingsSubcommand } from '../../../types/commands'
import { Core } from '../../../index'


export default class SetPrefixHanler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(_g: GuildData): [ string, string, any? ] {
    return null
  }

  public handle(_mes: Message, _args: string[], g: GuildData, reply: ReplyFunction): boolean {
    reply(
      Core.text(g, '=cmd_change_prefix_1'),
      Core.text(g, '=cmd_change_prefix_2')
    )
    return true
  }

}
