import { Core } from '../../../index'
import Emojis from '../../emojis'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType, InteractionComponentFlag } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import Tracker from '../../tracker'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData) return { title: 'An error occured' }
  Tracker.set(i.guildData, 'PAGE_DISCOVERED_SETTINGS_MAIN')

  return {
    title: '=cmd_free_title',
    description: 'bruh',
    components: [
      {
        type: ComponentType.BUTTON,
        style: Tracker.showHint(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_CHANNEL') ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_channel',
        label: i.guildData?.channelInstance ? 'Change channel' : 'Set channel',
        emoji: { id: Emojis.channel.id }
      },
      {
        type: ComponentType.BUTTON,
        style: Tracker.showHint(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_ROLE') ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_role',
        label: i.guildData?.roleInstance ? 'Change role mention' : 'Mention a role',
        emoji: { id: Emojis.mention.id }
      },
      {
        type: ComponentType.BUTTON,
        style: Tracker.showHint(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_LANGUAGE') ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_language',
        label: '=lang_name',
        emoji: { name: Emojis.fromFlagName(Core.text(i.guildData, '=lang_flag_emoji')).string }
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: Tracker.showHint(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_DISPLAY') ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_display',
        label: 'Display Settings'
      },
      {
        type: ComponentType.BUTTON,
        style: Tracker.showHint(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_FILTER') ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_filter',
        label: 'Filter Settings'
      },
      {
        type: ComponentType.BUTTON,
        style: Tracker.showHint(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_MORE') ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_more',
        label: 'More'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'admin_main',
        emoji: { name: '✨' },
        flags: [
          InteractionComponentFlag.ACCESS_BOT_ADMIN,
          InteractionComponentFlag.HIDE_IF_NOT_ALLOWED
        ]
      }
    ]
  }
}
