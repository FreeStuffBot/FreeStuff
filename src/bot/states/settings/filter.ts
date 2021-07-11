import Emojis from '../../emojis'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import MessageDistributor from '../../message-distributor'
import { MessageComponentSelectOption } from '../../../cordo/types/icomponent'
import Const from '../../const'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  return {
    title: 'Filter Settings',
    description: 'bla bla bla\nfor help join here or something lmao: https://discord.gg/WrnKKF8',
    components: []
  }
}
