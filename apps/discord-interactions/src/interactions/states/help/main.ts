import { Const, Emojis } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag } from 'cordo'


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
        emoji: Emojis.settings.toObject(),
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
        emoji: Emojis.bot.toObject()
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
