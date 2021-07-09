import { GameInfo } from 'freestuff'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionCommandHandler, InteractionReplyFunction } from '../../types/interactions'
import { GuildData } from '../../types/datastructs'
import Const from '../const'
import { Core } from '../../index'
import Experiments from '../../controller/experiments'
import Logger from '../../lib/logger'
import Emojis from '../../lib/emojis'


export default class NewSettingsCommand extends InteractionCommandHandler {

  public handle(_command: GenericInteraction, data: GuildData, reply: InteractionReplyFunction): boolean {
    reply('ChannelMessageWithSource', {
      title: '=cmd_free_title',
      description: 'bruh',
      components: [
        {
          type: ComponentType.ROW,
          components: [
            {
              type: ComponentType.BUTTON,
              style: data.channel ? ButtonStyle.SECONDARY : ButtonStyle.PRIMARY,
              custom_id: 'set_channel',
              label: data.channel ? 'Change channel' : 'Set channel',
              emoji: { id: Emojis.channel.id }
            },
            {
              type: ComponentType.BUTTON,
              style: data.language.startsWith('en') ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
              custom_id: 'set_language',
              label: 'Change language',
              emoji: { name: Emojis.fromFlagName(Core.text(data, '=lang_flag_emoji')).string }
            },
            {
              type: ComponentType.BUTTON,
              style: data.role ? ButtonStyle.SECONDARY : ButtonStyle.PRIMARY,
              custom_id: 'set_mention',
              label: data.role ? 'Change role mention' : 'Mention a role',
              emoji: { id: Emojis.mention.id }
            }
          ]
        },
        {
          type: ComponentType.ROW,
          components: [
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.PRIMARY,
              custom_id: 'settings_display',
              label: 'Display Settings'
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.PRIMARY,
              custom_id: 'settings_filter',
              label: 'Filter Settings'
            },
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.SECONDARY,
              custom_id: 'settings_advanced',
              label: 'More'
            }
          ]
        }
      ]
    })
    return true
  }

}
