import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponentSelectOption, MessageEmbed } from 'cordo'
import { Const, Localisation } from '@freestuffbot/common'
import Emojis from '../../emojis'
import Tracker from '../../tracker'
import MessageDistributor from '../../message-distributor'
import PermissionStrings from '../../../lib/permission-strings'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData) return { title: 'An error occured' }
  Tracker.set(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_DISPLAY')

  const themeOptions: MessageComponentSelectOption[] = Const.themes.map(t => ({
    value: t.id + '',
    label: t.name,
    description: t.description,
    default: i.guildData.theme.id === t.id,
    emoji: { name: t.emoji }
  }))

  const currencyOptions: MessageComponentSelectOption[] = Const.currencies
    .map(c => ({
      value: c.id + '',
      label: `${c.symbol} ${Localisation.text(i.guildData, c.name)}`,
      description: c.calculated ? '=price_converted' : '=price_actual',
      default: i.guildData.currency.id === c.id
    }))

  const message = MessageDistributor.buildMessage([ Const.testAnnouncementContent ], i.guildData, true, false)
  const embeds: MessageEmbed[] = []
  if (message.embeds?.length) {
    if (!PermissionStrings.containsManageServer(i.member.permissions) && message.embeds[0].footer?.text)
      message.embeds[0].footer.text += ' • ' + Localisation.text(i.guildData, '=settings_permission_disclaimer')
    embeds.push(...message.embeds as MessageEmbed[])
  }

  // embeds.push({
  //   description: 'hiii',
  //   color: Const.embedDefaultColor
  // } as MessageEmbed)

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
        disabled: !i.guildData.theme.toggleCurrencies,
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: '=generic_back',
        emoji: { id: Emojis.caretLeft.id }
      },
      {
        type: ComponentType.BUTTON,
        style: i.guildData.react ? ButtonStyle.SUCCESS : ButtonStyle.SECONDARY,
        custom_id: 'settings_reaction_toggle',
        label: i.guildData.react ? '=settings_display_reactions_on_state' : '=settings_display_reactions_on_prompt',
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
