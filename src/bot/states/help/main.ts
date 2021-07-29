import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import Const from '../../const'
import Emojis from '../../emojis'


export default function (_i: GenericInteraction): InteractionApplicationCommandCallbackData {
  return {
    description: 'Todo',
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: 'Bot Settings',
        emoji: { id: Emojis.settings.id }
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'about_main',
        label: 'About',
        emoji: { id: Emojis.bot.id }
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        url: Const.links.supportInvite,
        label: 'Support'
      }
    ]
  }
}
