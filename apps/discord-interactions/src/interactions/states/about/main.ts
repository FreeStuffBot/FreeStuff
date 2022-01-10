import { Const, Localisation } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag } from 'cordo'
import { Emojis } from '@freestuffbot/common'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  const guild = i.guildData
  const translationCredits = (!guild || guild.language.startsWith('en'))
    ? ''
    : `\n\n${Localisation.text(guild, '=translation_by')}\n${Localisation.getRaw(guild.language, 'translators').split(', ').map(n => `• ${n}`).join('\n')}`

  return {
    embeds: [
      {
        author: {
          name: '=cmd_info_1',
          // @ts-ignore
          icon_url: Const.brandIcons.regularSquare
        },
        description: Localisation.text(guild, '=cmd_info_2') + translationCredits,
        footer: {
          text: 'Copyright © 2020-2021 FreeStuff'
        }
      }
    ],
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        visible: !!guild,
        custom_id: 'settings_main',
        label: '=page_settings',
        emoji: Emojis.settings.toObject(),
        flags: [
          InteractionComponentFlag.ACCESS_MANAGE_SERVER,
          InteractionComponentFlag.HIDE_IF_NOT_ALLOWED
        ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'help_main',
        label: '=page_help',
        emoji: Emojis.support.toObject()
      }
    ],
    _context: {
      amazingPeople: Const.links.team,
      website: Const.links.website,
      inviteLink: Const.links.botInvite,
      discordInvite: Const.links.supportInvite
    }
  }
}
