import { TextChannel } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Core } from '../../index'
import Emojis from '../emojis'
import { ReplyableCommandInteraction, ReplyableComponentInteraction } from '../../cordo/types/ibase'
import { InteractionApplicationCommandCallbackData } from '../../cordo/types/custom'
import { ButtonStyle, ComponentType } from '../../cordo/types/iconst'


export function getBaseState(data: GuildData): InteractionApplicationCommandCallbackData {
  return {
    title: '=cmd_free_title',
    description: 'bruh',
    components: [
      {
        type: ComponentType.BUTTON,
        style: data?.channel ? ButtonStyle.SECONDARY : ButtonStyle.PRIMARY,
        custom_id: 'settings_channel',
        label: data?.channel ? 'Change channel' : 'Set channel',
        emoji: { id: Emojis.channel.id }
      },
      {
        type: ComponentType.BUTTON,
        style: data?.language?.startsWith('en') ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_language',
        label: 'Change language',
        emoji: { name: Emojis.fromFlagName(Core.text(data, '=lang_flag_emoji')).string }
      },
      {
        type: ComponentType.BUTTON,
        style: data?.role ? ButtonStyle.SECONDARY : ButtonStyle.PRIMARY,
        custom_id: 'settings_mention',
        label: data?.role ? 'Change role mention' : 'Mention a role',
        emoji: { id: Emojis.mention.id }
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.PRIMARY,
        custom_id: 'settings_display',
        label: 'Display Settings'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.PRIMARY,
        custom_id: 'settings_filter',
        label: 'Filter Settings'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_advanced',
        label: 'More'
      }
    ]
  }
}

export default function (i: ReplyableCommandInteraction, data: GuildData): boolean {
  i
    .reply(getBaseState(data))
    .withTimeout(10e3, true, (i: ReplyableComponentInteraction) => {
      i.edit({
        components: []
      })
    })
    // .on('settings_back', (i) => {
    //   //   edit(baseState)
    // })
    .on('settings_channel_pick', (_i) => {
      // if (event.component_type === 3)
      //   i.edit({ title: i.data.values.join(', ') })
    })
    .on('settings_channel', (i: ReplyableComponentInteraction) => {
      i.edit({
        title: 'display',
        components: [
          {
            type: ComponentType.SELECT,
            custom_id: 'settings_channel_pick',
            options: data.channelInstance.guild.channels.cache
              .array()
              .filter(c => (c.type === 'text' || c.type === 'news'))
              .filter(c => c.permissionsFor(Core.user).has('VIEW_CHANNEL'))
              .slice(0, 25)
              .map(c => ({
                label: `#${c.name}`.substr(0, 25),
                value: c.id,
                default: data.channel?.toString() === c.id,
                description: (c as TextChannel).topic?.substr(0, 50) || ''
              })),
            placeholder: 'Pick a channel to send games to'
          },
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.SECONDARY,
            custom_id: 'settings_back',
            label: 'Back'
          }
        ]
      })
    })
    .on('settings_display', (i: ReplyableComponentInteraction) => {
      i.edit({
        title: 'display',
        components: [
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.SECONDARY,
            custom_id: 'settings_back',
            label: 'Back'
          }
        ]
      })
    })
    .on('settings_advanced', (i: ReplyableComponentInteraction) => {
      i.edit({
        title: 'advanced',
        components: [
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.SECONDARY,
            custom_id: 'settings_back',
            label: 'Back'
          }
        ]
      })
    })
  return true
}
