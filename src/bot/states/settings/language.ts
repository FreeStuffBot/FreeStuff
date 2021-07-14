import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType, InteractionComponentFlag } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import Emojis from '../../emojis'
import LanguageManager from '../../language-manager'
import Tracker from '../../tracker'
import { Core } from '../../..'
import PermissionStrings from '../../../lib/permission-strings'


function buildDescriptionForLanguage(i: GenericInteraction, lang: { id: string, nameEn: string }, allowEastereggs: boolean): string {
  const name = lang.nameEn[0].toUpperCase() + lang.nameEn.substr(1).toLowerCase()
  if (lang.id.startsWith('en')) {
    if (lang.id.endsWith('US')) {
      return allowEastereggs
        ? '=settings_language_list_desc_english_us_easteregg'
        : '=settings_language_list_desc_english_us'
    } else {
      return '=settings_language_list_desc_english_eu'
    }
  }
  const out = Core.text(i.guildData, '=settings_language_list_desc_generic', {
    language: name,
    translators: LanguageManager.getRaw(lang.id, 'translators', false)
  })
  return (out.length > 50)
    ? out.substr(0, 47) + '...'
    : out
}

export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData) return { title: 'An error occured' }
  const firstTimeOnPage = !Tracker.isTracked(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_LANGUAGE')
  Tracker.set(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_LANGUAGE')

  const options = LanguageManager
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
