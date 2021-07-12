import { NewsChannel, TextChannel } from 'discord.js'
import { Core } from '../../../index'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import Emojis from '../../emojis'


const recommendedChannelRegex = /free|games|gaming|deals/i
const filterOutChannelRegex1 = /rules|meme|support/i
const filterOutChannelRegex2 = /log|help|selfies/i
const filterOutChannelRegex3 = /team|partner|suggestions/i
const highProbChannelRegex = /announcement|new|general|computer|play|important|feed/i

export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData)
    return { title: 'An error occured' }

  let channelsFound = Core.guilds.resolve(i.guild_id).channels.cache
    .array()
    .filter(c => (c.type === 'text' || c.type === 'news'))
    .filter((c) => {
      const p = c.permissionsFor(Core.user)
      return p.has('VIEW_CHANNEL') && p.has('SEND_MESSAGES')
    }) as (TextChannel | NewsChannel)[]

  let youHaveTooManyChannelsStage = 0

  // ah dang list is too long, let's start filtering some out
  if (channelsFound.length > 25) {
    channelsFound = channelsFound.filter(c => !c.nsfw)
    youHaveTooManyChannelsStage++
  }
  if (channelsFound.length > 25) {
    channelsFound = channelsFound.filter(c => !filterOutChannelRegex1.test(c.name) || recommendedChannelRegex.test(c.name))
    youHaveTooManyChannelsStage++
  }
  if (channelsFound.length > 25) {
    channelsFound = channelsFound.filter(c => !filterOutChannelRegex2.test(c.name) || recommendedChannelRegex.test(c.name))
    youHaveTooManyChannelsStage++
  }
  if (channelsFound.length > 25) {
    channelsFound = channelsFound.filter(c => !filterOutChannelRegex3.test(c.name) || recommendedChannelRegex.test(c.name))
    youHaveTooManyChannelsStage++
  }
  if (channelsFound.length > 25) {
    channelsFound = channelsFound.filter(c => highProbChannelRegex.test(c.name) || recommendedChannelRegex.test(c.name))
    youHaveTooManyChannelsStage++
  }

  // TODO in some absurd szenario there might be over 25 channels but then one regex kills all of them => empty array => error

  const options = channelsFound
    .sort((a, b) =>
      (recommendedChannelRegex.test(a.name) ? -1000 : 0)
      - (recommendedChannelRegex.test(b.name) ? -1000 : 0)
      + (a.position + a.parent.position * 100)
      - (b.position + b.parent.position * 100)
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
    description: `OH MY GOD, youHaveTooManyChannelsStage: ${youHaveTooManyChannelsStage}`,
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
