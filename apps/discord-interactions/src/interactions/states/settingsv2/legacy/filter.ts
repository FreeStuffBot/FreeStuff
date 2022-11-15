import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponentSelectOption } from 'cordo'
import { CMS, Const, Emojis, Errors, Localisation } from '@freestuffbot/common'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Tracker from '../../../../lib/tracker'


export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  const [ err1, guildData ] = await i.guildData.fetch()
  if (err1) return Errors.handleErrorAndCommunicate(err1)

  const [ err2, platforms ] = CMS.platforms
  if (err2) return Errors.handleErrorAndCommunicate(err2)

  Tracker.set(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_FILTER')

  const platformOptions: MessageComponentSelectOption[] = platforms
    .filter(p => !!p)
    .map(p => ({
      value: p.code,
      label: p.name,
      description: p.description,
      default: (guildData.platformsRaw & (1 << p.id)) !== 0,
      emoji: CMS.getPlatformDiscordEmoji(p.code).toObject()
    }))

  const priceOptions: MessageComponentSelectOption[] = Const.priceClasses
    .map(c => ({
      value: c.id + '',
      label: c.name,
      description: Localisation.text(
        i,
        c.from === 0
          ? '=settings_filter_price_class_desc_everything'
          : '=settings_filter_price_class_desc_generic',
        { price: Localisation.renderPriceTag(i, guildData.currency, c.from) }
      ),
      default: guildData.price.id === c.id
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
        style: guildData.trashGames
          ? ButtonStyle.SUCCESS
          : ButtonStyle.SECONDARY,
        custom_id: 'settings_trash_toggle',
        label: guildData.trashGames
          ? '=settings_filter_trash_on_state'
          : '=settings_filter_trash_on_prompt',
        emoji: { name: '🗑️' },
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.LINE_BREAK
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
        style: ButtonStyle.LINK,
        url: Const.links.guide,
        label: '=generic_help'
      }
    ],
    footer: PermissionStrings.containsManageServer(i.member.permissions) ? '' : '=settings_permission_disclaimer'
  }
}
