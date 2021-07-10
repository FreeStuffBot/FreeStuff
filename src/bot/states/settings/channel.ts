import { TextChannel } from 'discord.js'
import { Core } from '../../../index'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData)
    return { title: 'An error occured' }

  return {
    title: 'display',
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_channel_change',
        options: i.guildData.channelInstance.guild.channels.cache
          .array()
          .filter(c => (c.type === 'text' || c.type === 'news'))
          .filter(c => c.permissionsFor(Core.user).has('VIEW_CHANNEL'))
          .slice(0, 25)
          .map(c => ({
            label: `#${c.name}`.substr(0, 25),
            value: c.id,
            default: i.guildData.channel?.toString() === c.id,
            description: (c as TextChannel).topic?.substr(0, 50) || ''
          })),
        placeholder: 'Pick a channel to send games to'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: 'Back'
      }
    ]
  }
}
