import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponentSelectOption } from 'cordo'
import { Const, Localisation } from '@freestuffbot/common'
import Emojis from '../../emojis'
import Tracker from '../../tracker'
import PermissionStrings from '../../../lib/permission-strings'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData) return { title: 'An error occured' }
  Tracker.set(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_FILTER')

  const platformOptions: MessageComponentSelectOption[] = Const.platforms.map(p => ({
    value: p.id + '',
    label: p.name,
    description: p.description,
    default: (i.guildData?.platformsRaw & p.bit) !== 0,
    emoji: (Emojis.store[p.id] || Emojis.store.other).toObject()
  }))

  const priceOptions: MessageComponentSelectOption[] = Const.priceClasses.map(c => ({
    value: c.id + '',
    label: c.name,
    description: Localisation.text(
      i.guildData,
      c.from === 0
        ? '=settings_filter_price_class_desc_everything'
        : '=settings_filter_price_class_desc_generic',
      {
        price: (Localisation.text(i.guildData, '=currency_sign_position') === 'before')
          ? `${i.guildData.currency.symbol}${c.from}`
          : `${c.from}${i.guildData.currency.symbol}`
      }
    ),
    default: i.guildData?.price.id === c.id
  }))

  return {
    title: '=settings_filter_ui_1',
    description: '=settings_filter_ui_2',
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_platforms_change',
        options: platformOptions,
        placeholder: '=settings_filter_platforms_none',
        min_values: 0,
        max_values: platformOptions.length,
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_price_change',
        options: priceOptions,
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
        style: i.guildData?.trashGames ? ButtonStyle.SUCCESS : ButtonStyle.SECONDARY,
        custom_id: 'settings_trash_toggle',
        label: i.guildData?.trashGames ? '=settings_filter_trash_on_state' : '=settings_filter_trash_on_prompt',
        emoji: { name: '🗑️' },
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        url: Const.links.guide,
        label: '=generic_help'
      }
    ],
    footer: PermissionStrings.containsManageServer(i.member.permissions) ? '' : '=settings_permission_disclaimer'
  }
}
