import { NewsChannel, TextChannel } from 'discord.js'
import { Core } from '../../../index'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import Emojis from '../../emojis'


const recommendedChannelRegex = /free|games|gaming|deals/i
const filterOutChannelRegex = /rules|meme/i

export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData)
    return { title: 'An error occured' }

  let channelsFound = Core.guilds.resolve(i.guild_id).channels.cache
    .array()
    .filter(c => (c.type === 'text' || c.type === 'news'))
    .filter(c => c.permissionsFor(Core.user).has('VIEW_CHANNEL')) as (TextChannel | NewsChannel)[]

  // ah dang list is too long, let's start filtering some out
  if (channelsFound.length > 25)
    channelsFound = channelsFound.filter(c => !c.nsfw)
  if (channelsFound.length > 25)
    channelsFound = channelsFound.filter(c => !filterOutChannelRegex.test(c.name))

  const options = channelsFound
    .sort((a, b) =>
      (recommendedChannelRegex.test(b.name) ? 999 : 0) - (recommendedChannelRegex.test(a.name) ? 999 : 0)
      + (b.position - a.position)
    )
    .slice(0, 25)
    .map(c => ({
      label: c.name.substr(0, 25),
      value: c.id,
      default: i.guildData.channel?.toString() === c.id,
      description: (c as TextChannel).topic?.substr(0, 50) || '',
      emoji: {
        id: (c.type === 'news')
          ? recommendedChannelRegex.test(c.name)
            ? Emojis.announcementChannelGreen.id
            : Emojis.announcementChannel.id
          : recommendedChannelRegex.test(c.name)
            ? Emojis.channelGreen.id
            : Emojis.channel.id
      }
    }))

  return {
    title: 'display',
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_channel_change',
        options,
        placeholder: 'Pick a channel to send games to'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: 'Back',
        emoji: { id: Emojis.caretLeft.id }
      }
    ]
  }
}
