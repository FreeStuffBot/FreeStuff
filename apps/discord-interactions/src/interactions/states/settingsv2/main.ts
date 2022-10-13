import { Const, Emojis, Errors } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, InteractionType } from 'cordo'
import Tracker from '../../../lib/tracker'


const recentlyInSetup: string[] = []

export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return Errors.handleErrorAndCommunicate(err)

  const firstTimeOnPage = !Tracker.syncIsTracked(guildData, 'PAGE_DISCOVERED_SETTINGS_MAIN')
  Tracker.set(guildData, 'PAGE_DISCOVERED_SETTINGS_MAIN')

  const hintChannel = !guildData.channel
  const hintRole = !hintChannel && Tracker.syncShowHint(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_ROLE')
  const hintFilter = !hintChannel && !hintRole && Tracker.syncShowHint(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_FILTER')
  const hintDisplay = !hintChannel && !hintRole && !hintFilter && Tracker.syncShowHint(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_DISPLAY')

  if ((hintChannel || hintRole || hintFilter || hintDisplay) && !recentlyInSetup.includes(i.guild_id)) {
    recentlyInSetup.push(i.guild_id)
    setTimeout(() => recentlyInSetup.splice(0, 1), 1000 * 60 * 5)
  }

  const delayed = !firstTimeOnPage && i.type === InteractionType.COMMAND
  let description = recentlyInSetup.includes(i.guild_id)
    ? '=settings_main_ui_2_guided_finished'
    : '=settings_main_ui_2_regular'
  if (hintChannel) {
    description = delayed
      ? '=settings_main_ui_2_guided_channel_delayed'
      : '=settings_main_ui_2_guided_channel_normal'
  } else if (hintRole) {
    description = delayed
      ? '=settings_main_ui_2_guided_role_delayed'
      : '=settings_main_ui_2_guided_role_normal'
  } else if (hintFilter) {
    description = delayed
      ? '=settings_main_ui_2_guided_filter_delayed'
      : '=settings_main_ui_2_guided_filter_normal'
  } else if (hintDisplay) {
    description = delayed
      ? '=settings_main_ui_2_guided_display_delayed'
      : '=settings_main_ui_2_guided_display_normal'
  }

  return {
    title: '=settings_main_ui_1',
    description,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        custom_id: 'settingsv2_sub_free_main',
        label: 'Free to keep'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        custom_id: 'settingsv2_sub_weekend_main',
        label: 'Free Weekend'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_more',
        label: 'DLC\'s & More'
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_display',
        label: 'Prime Gaming' + ' ' + Const.premiumIndicatorSymbol
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_filter',
        label: 'Game Pass' + ' ' + Const.premiumIndicatorSymbol
      }
    ],
    _context: {
      invite: Const.links.supportInvite,
      guide: Const.links.guide
    }
  }
}
