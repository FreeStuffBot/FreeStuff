import Emojis from '../../emojis'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  return {
    title: 'More',
    description: 'bla bla bla\nfor help join here or something lmao: https://discord.gg/WrnKKF8\nprivacy policy, terms of service, etc',
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: 'Back',
        emoji: { id: Emojis.caretLeft.id }
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_mydata_request',
        label: 'View my Data'
      },
      {
        type: ComponentType.BUTTON,
        style: i.guildData?.beta ? ButtonStyle.SUCCESS : ButtonStyle.SECONDARY,
        custom_id: 'settings_beta_toggle',
        label: i.guildData?.beta ? "You're in beta!" : 'Opt in to Beta'
      }
    ]
  }
}
