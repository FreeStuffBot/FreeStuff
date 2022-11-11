import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag } from 'cordo'
import { Emojis, Errors, Localisation } from '@freestuffbot/common'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Tracker from '../../../lib/tracker'


export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return Errors.handleErrorAndCommunicate(err)

  const firstTimeOnPage = !Tracker.syncIsTracked(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_LANGUAGE')
  Tracker.set(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_LANGUAGE')

  const options = Localisation
    .getAllLanguages()
    .sort((a, b) => (b.ranking - a.ranking))
    .slice(0, 25)
    .sort((a, b) => (a.id < b.id ? -1 : (a.id > b.id ? 1 : 0)))
    .map(l => ({
      label: l.name,
      value: l.id,
      default: guildData.language === l.id,
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

function buildDescriptionForLanguage(i: GenericInteraction, lang: { id: string, nameEn: string }, allowEastereggs: boolean): string {
  const name = lang.nameEn[0].toUpperCase() + lang.nameEn.substring(1).toLowerCase()
  if (lang.id.startsWith('en')) {
    if (!lang.id.endsWith('US'))
      return '=settings_language_list_desc_english_eu'

    return allowEastereggs
      ? '=settings_language_list_desc_english_us_easteregg'
      : '=settings_language_list_desc_english_us'
  }

  const out = Localisation.text(i, '=settings_language_list_desc_generic', {
    language: name,
    translators: Localisation.getRaw(lang.id, 'translators', false)
  })

  return (out.length > 50)
    ? out.substring(0, 47) + '...'
    : out
}
