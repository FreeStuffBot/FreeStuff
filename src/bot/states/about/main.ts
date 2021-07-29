import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { Core } from '../../..'
import Const from '../../const'
import Emojis from '../../emojis'
import LanguageManager from '../../language-manager'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  const translationCredits = i.guildData.language.startsWith('en')
    ? ''
    : `\n\n${Core.text(i.guildData, '=translation_by')}\n${LanguageManager.getRaw(i.guildData.language, 'translators').split(', ').map(n => `• ${n}`).join('\n')}`

  return {
    embeds: [
      {
        author: {
          name: '=cmd_info_1',
          // @ts-ignore
          icon_url: Const.brandIcons.regularSquare
        },
        description: Core.text(i.guildData, '=cmd_info_2') + translationCredits,
        footer: {
          text: 'Copyright © 2020-2021 FreeStuff'
        }
      }
    ],
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
        custom_id: 'help_main',
        label: 'Help Page',
        emoji: { id: Emojis.support.id }
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
