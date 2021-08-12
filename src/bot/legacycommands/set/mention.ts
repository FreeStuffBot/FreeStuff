import { Message } from 'discord.js'
import { GuildData } from '../../../types/datastructs'
import { ReplyFunction, CommandHandler, SettingsSubcommand } from '../../../types/commands'
import { Core } from '../../../index'
import DatabaseManager from '../../database-manager'


export default class SetMentionHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(g: GuildData): ([ string, string, any? ])[] {
    return [
      [
        'mention @' + ((g && g.roleInstance) ? g.roleInstance.name : 'role'),
        '=cmd_settings_change_mention'
      ],
      [
        'mention',
        '=cmd_settings_change_mention_noone'
      ]
    ]
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      if (g.role) {
        DatabaseManager.changeSetting(g, 'role', undefined)
        reply(
          Core.text(g, '=cmd_set_mention_success_none_changed_1'),
          Core.text(g, '=cmd_set_mention_success_none_changed_2')
        )
      } else {
        reply(
          Core.text(g, '=cmd_set_mention_success_none_unchanged_1'),
          Core.text(g, '=cmd_set_mention_success_none_unchanged_2')
        )
      }
      return false
    }
    if (mes.mentions.everyone) {
      if (g.channelInstance && !mes.guild.me.permissionsIn(g.channelInstance).has('MENTION_EVERYONE')) {
        reply(
          Core.text(g, '=cmd_set_mention_no_permission_1'),
          Core.text(g, '=cmd_set_mention_no_permission_2', { channel: g.channelInstance.toString() })
        )
        return false
      }
      DatabaseManager.changeSetting(g, 'role', '1')
      reply(
        Core.text(g, '=cmd_set_mention_success_everyone_1'),
        Core.text(g, '=cmd_set_mention_success_everyone_2')
      )
      return false
    }
    if (!mes.mentions.roles.size) {
      reply(
        Core.text(g, '=cmd_set_mention_not_found_1'),
        Core.text(g, '=cmd_set_mention_not_found_2', { name: args[0] })
      )
      return false
    }

    const role = mes.mentions.roles.first()
    if (!role) return false
    DatabaseManager.changeSetting(g, 'role', role.id)
    reply(
      Core.text(g, '=cmd_set_mention_success_regular_1'),
      Core.text(g, '=cmd_set_mention_success_regular_2', { role: role.toString() })
    )

    return true
  }

}
