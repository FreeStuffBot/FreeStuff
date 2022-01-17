import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponentSelectOption, MessageEmbed } from 'cordo'
import { Const, Emojis, Localisation, Themes } from '@freestuffbot/common'
import Tracker from '../../../lib/tracker'
import Errors from '../../../lib/errors'
import PermissionStrings from 'cordo/dist/lib/permission-strings'


export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return Errors.handleErrorAndCommunicate(err)

  Tracker.set(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_DISPLAY')

  const themeOptions: MessageComponentSelectOption[] = Const.themes.map(t => ({
    value: t.id + '',
    label: t.name,
    description: t.description,
    default: guildData.theme.id === t.id,
    emoji: { name: t.emoji }
  }))

  const currencyOptions: MessageComponentSelectOption[] = Const.currencies
    .map(c => ({
      value: c.id + '',
      label: `${c.symbol} ${Localisation.text(i, c.name)}`,
      description: c.calculated ? '=price_converted' : '=price_actual',
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
      {
        type: ComponentType.BUTTON,
        style: guildData.react ? ButtonStyle.SUCCESS : ButtonStyle.SECONDARY,
        custom_id: 'settings_reaction_toggle',
        label: guildData.react ? '=settings_display_reactions_on_state' : '=settings_display_reactions_on_prompt',
        emoji: { name: '🆓' },
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
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
