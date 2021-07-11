import Emojis from '../../emojis'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import { MessageComponentSelectOption } from '../../../cordo/types/icomponent'
import Const from '../../const'
import { Core } from '../../../index'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  const storeOptions: MessageComponentSelectOption[] = Const.themes.map(t => ({
    value: t.id + '',
    label: t.name,
    description: t.description,
    default: i.guildData?.theme.id === t.id,
    emoji: { name: t.emoji }
  }))

  const priceOptions: MessageComponentSelectOption[] = Const.priceClasses.map(c => ({
    value: c.id + '',
    label: c.name,
    description: 'Anything worth {price} or more before the discount',
    default: false, // TODO i.guildData?.currency
    _context: {
      price: (Core.text(i.guildData, '=currency_sign_position') === 'before')
        ? `${i.guildData.currency}`
        : 'TODO'
    }
  }))

  return {
    title: 'Filter Settings',
    description: 'bla bla bla\nfor help join here or something lmao: https://discord.gg/WrnKKF8',
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_stores_change',
        options: storeOptions
      },
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_price_change',
        options: priceOptions
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
        custom_id: 'settings_trash_toggle',
        label: i.guildData?.react ? 'Bad Quality Games Enabled' : 'Enable Bad Quality Games',
        emoji: { name: '🗑️' }
      }
    ]
  }
}
