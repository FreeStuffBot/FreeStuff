import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag } from 'cordo'
import { Localisation } from '@freestuffbot/common'
import Emojis from '../../emojis'
import Tracker from '../../tracker'
import PermissionStrings from '../../../lib/permission-strings'


function buildDescriptionForLanguage(i: GenericInteraction, lang: { id: string, nameEn: string }, allowEastereggs: boolean): string {
  const name = lang.nameEn[0].toUpperCase() + lang.nameEn.substring(1).toLowerCase()
  if (lang.id.startsWith('en')) {
    if (lang.id.endsWith('US')) {
      return Localisation.getLine(i.guildData, allowEastereggs
        ? '=settings_language_list_desc_english_us_easteregg'
        : '=settings_language_list_desc_english_us').substring(0, 50)
    } else {
      return Localisation.getLine(i.guildData, 'settings_language_list_desc_english_eu').substring(0, 50)
    }
  }
  const out = Localisation.text(i.guildData, '=settings_language_list_desc_generic', {
    language: name,
    translators: Localisation.getRaw(lang.id, 'translators', false)
  })
  return (out.length > 50)
    ? out.substring(0, 47) + '...'
    : out
}

export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData) return { title: 'An error occured' }
  const firstTimeOnPage = !Tracker.isTracked(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_LANGUAGE')
  Tracker.set(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_LANGUAGE')

  const options = Localisation
    .getAllLanguages()
    .sort((a, b) => (b.ranking - a.ranking))
    .slice(0, 25)
    .sort((a, b) => (a.id < b.id ? -1 : (a.id > b.id ? 1 : 0)))
    .map(l => ({
      label: l.name,
      value: l.id,
      default: i.guildData.language === l.id,
      description: buildDescriptionForLanguage(i, l, !firstTimeOnPage),
      emoji: { name: Emojis.fromFlagName(l.flag).string }
    }))

  return {
    title: '=settings_language_ui_1',
    description: '=settings_language_ui_2',
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_language_change',
        options,
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: '=generic_back',
        emoji: { id: Emojis.caretLeft.id }
      }
    ],
    footer: PermissionStrings.containsManageServer(i.member.permissions) ? '' : '=settings_permission_disclaimer'
  }
}
