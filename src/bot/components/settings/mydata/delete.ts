import PermissionStrings from '../../../../lib/permission-strings'
import { ReplyableComponentInteraction } from '../../../../cordo/types/ibase'
import { ButtonStyle, ComponentType, InteractionComponentFlag } from '../../../../cordo/types/iconst'
import Emojis from '../../../emojis'


export const onGuildDataDeleteCooldown: string[] = []

export default function (i: ReplyableComponentInteraction) {
  // TODO if user is not admin show them they can't do that
  const isAdmin = i.member && PermissionStrings.containsAdmin(i.member.permissions)
  const onCooldown = onGuildDataDeleteCooldown.includes(i.guild_id)

  i.edit({
    title: isAdmin
      ? onCooldown
        ? 'Slow down!'
        : 'Are you sure?'
      : 'Only an admin can do this',
    description: isAdmin
      ? onCooldown
        ? 'Looks like someone already deleted this server\'s data in the past 12h. Please try again later!'
        : 'Once you click the button below there is no going back?'
      : 'Please ask someone else if you really really wanna do this.',
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_mydata_delete_cancel',
        label: 'Cancel',
        emoji: { id: Emojis.caretLeft.id },
        flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.DANGER,
        label: 'Delete',
        custom_id: 'settings_mydata_delete_confirm',
        disabled: !isAdmin || onCooldown,
        flags: [
          // because this is a reply to a bot message the interaction owner is now the bot itself no longer the user. Since this is ephemeral anyway it doesn't matter tho
          InteractionComponentFlag.ACCESS_EVERYONE,
          InteractionComponentFlag.ACCESS_ADMIN
        ]
      }
    ]
  })
}
