import { ReplyableComponentInteraction } from '../../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../../cordo/types/iconst'
import Emojis from '../../../emojis'


export default function (i: ReplyableComponentInteraction) {
  // TODO if user is not admin show them they can't do that

  i.edit({
    title: 'Are you sure?',
    description: 'Once you click the button below there is no going back?',
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_mydata_delete_cancel',
        label: 'Cancel',
        emoji: { id: Emojis.caretLeft.id }
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.DANGER,
        label: 'Delete',
        custom_id: 'settings_mydata_delete_confirm'
      }
    ]
  })
}
