import { Emojis } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, InteractionComponentFlag, ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'


export const onGuildDataDeleteCooldown: string[] = []

export default function (i: ReplyableComponentInteraction) {
  const isAdmin = i.member && PermissionStrings.containsAdmin(i.member.permissions)
  const onCooldown = onGuildDataDeleteCooldown.includes(i.guild_id)

  i.edit({
    title: isAdmin
      ? onCooldown
        ? '=settings_guilddata_delete_dialogue_cooldown_1'
        : '=settings_guilddata_delete_dialogue_confirmation_1'
      : '=settings_guilddata_delete_dialogue_not_allowed_1',
    description: isAdmin
      ? onCooldown
        ? '=settings_guilddata_delete_dialogue_cooldown_2'
        : '=settings_guilddata_delete_dialogue_confirmation_2'
      : '=settings_guilddata_delete_dialogue_not_allowed_2',
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_guilddata_delete_cancel',
        label: '=generic_cancel',
        emoji: Emojis.caretLeft.toObject(),
        flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.DANGER,
        label: '=generic_delete',
        custom_id: 'settings_guilddata_delete_confirm',
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
