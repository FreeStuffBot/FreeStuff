import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponentSelectOption, MessageEmbed } from 'cordo'
import { CMS, Const, Emojis, Errors, Localisation, Themes } from '@freestuffbot/common'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Tracker from '../../../../lib/tracker'


export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  const [ err1, guildData ] = await i.guildData.fetch()
  if (err1) return Errors.handleErrorAndCommunicate(err1)

  const [ err2, currencies ] = CMS.currencies
  if (err2) return Errors.handleErrorAndCommunicate(err2)

  Tracker.set(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_DISPLAY')

  const themeOptions: MessageComponentSelectOption[] = Const.themes
    .map(t => ({
      value: t.id + '',
      label: t.name,
      description: t.description,
      default: guildData.theme.id === t.id,
      emoji: { name: t.emoji }
    }))

  const languageOptions = Localisation
    .getAllLanguages()
    .sort((a, b) => (b.ranking - a.ranking))
    .slice(0, 25)
    .sort((a, b) => (a.id < b.id ? -1 : (a.id > b.id ? 1 : 0)))
    .map(l => ({
      label: l.name,
      value: l.id,
      default: guildData.language === l.id,
      description: buildDescriptionForLanguage(i, l),
      emoji: { name: Emojis.fromFlagName(l.flag).string }
    }))

  const currencyOptions: MessageComponentSelectOption[] = currencies
    .filter(c => !!c)
    .map(c => ({
      value: c.code,
      label: `${c.symbol} ${Localisation.text(i, c.name)}`,
      // description: c.calculated ? '=price_converted' : '=price_actual',
      default: guildData.currency.id === c.id
    }))

  const message = Themes.build([ Const.testAnnouncementContent ], guildData, { test: true, donationNotice: false })
  const embeds: MessageEmbed[] = []
  if (message.embeds?.length) {
    if (!PermissionStrings.containsManageServer(i.member.permissions) && message.embeds[0].footer?.text)
      message.embeds[0].footer.text += ' • ' + Localisation.text(i, '=settings_permission_disclaimer')
    embeds.push(...message.embeds as MessageEmbed[])
  }

  return {
    content: message.content,
    embeds,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_theme_change',
        options: themeOptions,
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_language_change',
        options: languageOptions,
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_currency_change',
        options: currencyOptions,
        disabled: !guildData.theme.toggleCurrencies,
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: '=generic_back',
        emoji: Emojis.caretLeft.toObject()
      },
      // {
      //   type: ComponentType.BUTTON,
      //   style: guildData.react ? ButtonStyle.SUCCESS : ButtonStyle.SECONDARY,
      //   custom_id: 'settings_reaction_toggle',
      //   label: guildData.react ? '=settings_display_reactions_on_state' : '=settings_display_reactions_on_prompt',
      //   emoji: { name: '🆓' },
      //   flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      // },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        url: Const.links.guide,
        label: '=generic_help'
      }
    ],
    allowed_mentions: {
      parse: []
    }
  }
}

function buildDescriptionForLanguage(i: GenericInteraction, lang: { id: string, nameEn: string }): string {
  const name = lang.nameEn[0].toUpperCase() + lang.nameEn.substring(1).toLowerCase()
  if (lang.id.startsWith('en')) {
    if (!lang.id.endsWith('US'))
      return '=settings_language_list_desc_english_eu'

    return Math.random() < 0.2
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
