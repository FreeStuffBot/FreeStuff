import { Permissions } from 'discord.js'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import Emojis from '../../emojis'
import { Core } from '../../../index'
import { MessageComponentSelectOption } from '../../../cordo/types/icomponent'


const recommendedRoleRegex = /free|games|deals/i

export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  if (!i.guildData)
    return { title: 'An error occured' }

  const member = await Core.guilds.resolve(i.guild_id).members.fetch(Core.user)
  const permissions: Permissions = i.guildData.channelInstance
    ? member.permissionsIn(i.guildData.channelInstance)
    : member.permissions

  const everyone = permissions.has('MENTION_EVERYONE')

  const roles = Core.guilds.resolve(i.guild_id).roles.cache
    .array()
    .sort((a, b) =>
      (recommendedRoleRegex.test(b.name) ? 999 : 0) - (recommendedRoleRegex.test(a.name) ? 999 : 0)
      + (b.position - a.position)
    )
    .filter(r => (r.mentionable || everyone) && (r.name !== '@everyone') && (!r.managed))
    .slice(0, 23)

  const options: MessageComponentSelectOption[] = [
    {
      label: 'Disable Mentions',
      value: '0',
      default: !i.guildData.role || i.guildData.role?.toString() === '0',
      description: 'Do not ping anyone.',
      emoji: { id: Emojis.no.id }
    },
    {
      label: '@everyone',
      value: '1',
      default: i.guildData.role?.toString() === '1',
      description: 'Ping everyone. That\'s a lot of people.',
      emoji: { id: Emojis.global.id }
    },
    ...roles.map(r => ({
      label: r.name.substr(0, 25),
      value: r.id,
      default: i.guildData.role?.toString() === r.id,
      emoji: { id: recommendedRoleRegex.test(r.name) ? Emojis.mentionGreen.id : Emojis.mention.id }
    }))
  ]

  let text = 'Pick a role to ping when a new game becomes free!'
  if (!everyone) text = Core.text(i.guildData, text) + '\n\n' + Core.text(i.guildData, 'Some roles might be hidden because the bot doesn\'t have the `Mention All Roles` permission!')

  return {
    title: 'PING PONG',
    description: text,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_role_change',
        options,
        placeholder: 'Pick a role to ping'
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
