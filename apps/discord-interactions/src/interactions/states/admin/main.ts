import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { Emojis } from '@freestuffbot/common'


export default function (_i: GenericInteraction, args: [ boolean ]): InteractionApplicationCommandCallbackData {
  // row one: server specific
  // row two: global
  return {
    title: 'Super Secret Admin Panel 🚀',
    description: 'poggers',
    components: [
      {
        type: ComponentType.BUTTON,
        style: args[0] ? ButtonStyle.SUCCESS : ButtonStyle.SECONDARY,
        custom_id: 'admin_refetch',
        label: '[Refetch]'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'admin_experiments',
        label: 'Show Experiments'
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: '=generic_back',
        emoji: Emojis.caretLeft.toObject()
      }
    ]
  }
}
