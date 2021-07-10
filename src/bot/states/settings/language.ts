import { TextChannel } from 'discord.js'
import { Core } from '../../../index'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import Emojis from '../../emojis'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData)
    return { title: 'An error occured' }

  return {
    title: 'display',
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_language_change',
        options: [],
        // TODO all languages POGGGG (but somehow find a solution for showing more than 25)
        // maybe a "Show more..." option at the bottom or something idk
        placeholder: 'Pick a channel to send games to'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: 'Back',
        emoji: { id: Emojis.caretLeft.id }
      }
    ]
  }
}
