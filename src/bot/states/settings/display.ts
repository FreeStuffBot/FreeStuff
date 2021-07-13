import { MessageEmbed } from 'discord.js'
import Emojis from '../../emojis'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType, InteractionComponentFlag } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import { MessageComponentSelectOption } from '../../../cordo/types/icomponent'
import Const from '../../const'
import Tracker from '../../tracker'
import MessageDistributor from '../../message-distributor'


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
    label: `${c.symbol} ${c.name}`,
    default: i.guildData.currency.id === c.id
  }))

  const message = MessageDistributor.buildMessage(Const.testAnnouncementContent, i.guildData, true, true)
  const embeds: MessageEmbed[] = []
  if (message[1].embed) embeds.push(message[1].embed as MessageEmbed)

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
        label: 'Back',
        emoji: { id: Emojis.caretLeft.id }
      },
      {
        type: ComponentType.BUTTON,
        style: i.guildData.react ? ButtonStyle.SUCCESS : ButtonStyle.SECONDARY,
        custom_id: 'settings_reaction_toggle',
        label: i.guildData.react ? 'Auto Reaction Enabled' : 'Enable Auto Reaction',
        emoji: { name: '🆓' },
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        url: Const.links.guide,
        label: 'Help'
      }
    ]
  }
}
