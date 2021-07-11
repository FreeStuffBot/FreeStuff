import Emojis from '../../emojis'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import MessageDistributor from '../../message-distributor'
import { MessageComponentSelectOption } from '../../../cordo/types/icomponent'
import Const from '../../const'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  const themeOptions: MessageComponentSelectOption[] = MessageDistributor.themes.map((t, n) => ({
    value: n + '',
    label: t.name,
    description: t.description,
    default: i.guildData?.theme === n,
    emoji: { name: t.emoji }
  }))

  const currencyOptions: MessageComponentSelectOption[] = Const.currencies.map(c => ({
    value: c.value + '',
    label: `${c.symbol} ${c.name}`,
    default: false // TODO i.guildData?.currency
  }))

  // TODO: make the actual embed here be a test message with those settings applied
  // second embed below that one with just a description: for more info click here -> fsb.xyz/guide

  return {
    title: 'Display Settings',
    description: 'bla bla bla\nfor help join here or something lmao: https://discord.gg/WrnKKF8',
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_theme_change',
        options: themeOptions
      },
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_currency_change',
        options: currencyOptions
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
        style: i.guildData?.react ? ButtonStyle.SUCCESS : ButtonStyle.SECONDARY,
        custom_id: 'settings_reaction_toggle',
        label: i.guildData?.react ? 'Auto Reaction Enabled' : 'Enable Auto Reaction',
        emoji: { name: '🆓' }
      }
    ]
  }
}
