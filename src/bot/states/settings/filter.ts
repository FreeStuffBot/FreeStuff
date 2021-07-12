import Emojis from '../../emojis'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import { MessageComponentSelectOption } from '../../../cordo/types/icomponent'
import Const from '../../const'
import { Core } from '../../../index'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  const platformOptions: MessageComponentSelectOption[] = Const.platforms.map(p => ({
    value: p.id + '',
    label: p.name,
    description: p.description,
    default: (i.guildData?.platformsRaw & p.bit) !== 0,
    emoji: p.emoji.toObject()
  }))

  const priceOptions: MessageComponentSelectOption[] = Const.priceClasses.map(c => ({
    value: c.id + '',
    label: c.name,
    description: Core.text(i.guildData, 'Only games worth {price} or more before the discount', {
      price: (Core.text(i.guildData, '=currency_sign_position') === 'before')
        ? `${i.guildData.currency.symbol}${c.from}`
        : `${c.from} ${i.guildData.currency.symbol}`
    }),
    default: i.guildData?.price.id === c.id
  }))

  return {
    title: 'Filter Settings',
    description: 'bla bla bla\nfor help join here or something lmao: https://discord.gg/WrnKKF8',
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_platforms_change',
        options: platformOptions,
        placeholder: '(All disabled)',
        min_values: 0,
        max_values: platformOptions.length
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
        style: i.guildData?.trashGames ? ButtonStyle.SUCCESS : ButtonStyle.SECONDARY,
        custom_id: 'settings_trash_toggle',
        label: i.guildData?.trashGames ? 'Bad Quality Games Enabled' : 'Enable Bad Quality Games',
        emoji: { name: '🗑️' }
      }
    ]
  }
}
