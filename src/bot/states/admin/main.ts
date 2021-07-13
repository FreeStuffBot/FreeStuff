import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import Tracker from '../../tracker'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData) return { title: 'An error occured' }
  Tracker.set(i.guildData, 'PAGE_DISCOVERED_SETTINGS_MAIN')

  return {
    title: 'Super Secret Admin Panel 🚀',
    description: 'poggers',
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'poggers',
        label: 'poggers'
      }
    ]
  }
}
