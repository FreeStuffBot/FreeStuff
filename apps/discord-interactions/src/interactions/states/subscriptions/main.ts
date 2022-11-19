import { Const, Emojis, Errors } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionType } from 'cordo'
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
    title: 'Your Subscriptions',
    description,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settingsv2_sub_free_main',
        emoji: Emojis.toggleOn.toObject(),
        label: 'Free to keep'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settingsv2_sub_weekend_main',
        emoji: Emojis.toggleOn.toObject(),
        label: 'Free Weekend'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_more',
        emoji: Emojis.toggleOff.toObject(),
        label: 'DLC\'s & More'
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_display',
        emoji: Emojis.toggleOff.toObject(),
        label: 'Prime Gaming' + ' ' + Const.premiumIndicatorSymbol
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_filter',
        emoji: Emojis.toggleOff.toObject(),
        label: 'Game Pass' + ' ' + Const.premiumIndicatorSymbol
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settingsv2_main',
        label: '=generic_back',
        emoji: Emojis.caretLeft.toObject()
      }
    ],
    _context: {
      invite: Const.links.supportInvite,
      guide: Const.links.guide
    }
  }
}
