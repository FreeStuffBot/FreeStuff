import Emojis from '../../emojis'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag } from 'cordo'
import Tracker from '../../tracker'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  Tracker.set(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_MORE')

  return {
    title: '=settings_more_ui_1',
    description: '=settings_more_ui_2',
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: '=generic_back',
        emoji: { id: Emojis.caretLeft.id }
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_guilddata',
        label: '=settings_more_btn_guilddata',
        flags: [ InteractionComponentFlag.ACCESS_EVERYONE, InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.BUTTON,
        style: i.guildData?.beta ? ButtonStyle.SUCCESS : ButtonStyle.SECONDARY,
        custom_id: 'settings_beta_toggle',
        label: i.guildData?.beta ? '=settings_more_beta_on_state' : '=settings_more_beta_on_prompt',
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      }
    ]
  }
}
