import { Core } from '../../../index'
import Emojis from '../../emojis'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  return {
    title: '=cmd_free_title',
    description: 'bruh',
    components: [
      {
        type: ComponentType.BUTTON,
        style: i.guildData?.channelInstance ? ButtonStyle.SECONDARY : ButtonStyle.PRIMARY,
        custom_id: 'settings_channel',
        label: i.guildData?.channelInstance ? 'Change channel' : 'Set channel',
        emoji: { id: Emojis.channel.id }
      },
      {
        type: ComponentType.BUTTON,
        style: i.guildData?.roleInstance ? ButtonStyle.SECONDARY : ButtonStyle.PRIMARY,
        custom_id: 'settings_role',
        label: i.guildData?.roleInstance ? 'Change role mention' : 'Mention a role',
        emoji: { id: Emojis.mention.id }
      },
      {
        type: ComponentType.BUTTON,
        style: i.guildData?.language?.startsWith('en') ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_language',
        label: '=lang_name',
        emoji: { name: Emojis.fromFlagName(Core.text(i.guildData, '=lang_flag_emoji')).string }
      },
      {
        type: ComponentType.LINE_BREAK
      },
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
        custom_id: 'settings_more',
        label: 'More'
      }
    ]
  }
}
