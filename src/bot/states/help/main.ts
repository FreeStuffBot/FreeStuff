import { Const } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag } from 'cordo'
import Emojis from '../../emojis'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  return {
    title: '=help_main_1',
    description: '=help_main_2',
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        visible: !!i.guildData,
        custom_id: 'settings_main',
        label: '=page_settings',
        emoji: { id: Emojis.settings.id },
        flags: [
          InteractionComponentFlag.ACCESS_MANAGE_SERVER,
          InteractionComponentFlag.HIDE_IF_NOT_ALLOWED
        ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'about_main',
        label: '=page_about',
        emoji: { id: Emojis.bot.id }
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        url: Const.links.supportInvite,
        label: '=page_support'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        url: Const.links.botInvite,
        label: '=page_invite'
      }
    ]
  }
}
