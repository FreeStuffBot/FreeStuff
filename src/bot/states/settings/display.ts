import { MessageEmbed } from 'discord.js'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponentSelectOption } from 'cordo'
import Emojis from '../../emojis'
import Const from '../../const'
import Tracker from '../../tracker'
import MessageDistributor from '../../message-distributor'
import { Core } from '../../..'
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

  const currencyOptions: MessageComponentSelectOption[] = Const.currencies.map(c => ({
    value: c.id + '',
    label: `${c.symbol} ${Core.text(i.guildData, c.name)}`,
    default: i.guildData.currency.id === c.id
  }))

  const message = MessageDistributor.buildMessage([ Const.testAnnouncementContent ], i.guildData, true)
  const embeds: MessageEmbed[] = []
  if (message[1].embed) {
    if (!PermissionStrings.containsManageServer(i.member.permissions) && message[1].embed.footer?.text)
      message[1].embed.footer.text += ' • ' + Core.text(i.guildData, '=settings_permission_disclaimer')
    embeds.push(message[1].embed as MessageEmbed)
  }

  // embeds.push({
  //   description: 'hiii',
  //   color: Const.embedDefaultColor
  // } as MessageEmbed)

  return {
    content: message[0],
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
