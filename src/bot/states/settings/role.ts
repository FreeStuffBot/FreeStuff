import { Permissions } from 'discord.js'
import { GenericInteraction } from '../../../cordo/types/ibase'
import { ButtonStyle, ComponentType, InteractionComponentFlag } from '../../../cordo/types/iconst'
import { InteractionApplicationCommandCallbackData } from '../../../cordo/types/custom'
import Emojis from '../../emojis'
import { Core } from '../../../index'
import { MessageComponentSelectOption } from '../../../cordo/types/icomponent'
import Tracker from '../../tracker'
import PermissionStrings from '../../../lib/permission-strings'


const recommendedRoleRegex = /free|game|deal|ping|notification/i

export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  if (!i.guildData) return { title: 'An error occured' }
  Tracker.set(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_ROLE')

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
  const overflow = Core.guilds.resolve(i.guild_id).roles.cache.size > 23

  const options: MessageComponentSelectOption[] = [
    {
      label: '=settings_role_list_no_mention_1',
      value: '0',
      default: !i.guildData.role || i.guildData.role?.toString() === '0',
      description: '=settings_role_list_no_mention_2',
      emoji: { id: Emojis.no.id }
    },
    {
      label: '=settings_role_list_everyone_1',
      value: '1',
      default: i.guildData.role?.toString() === '1',
      description: '=settings_role_list_everyone_2',
      emoji: { id: Emojis.global.id }
    },
    ...roles.map(r => ({
      label: r.name.substr(0, 25),
      value: r.id,
      default: i.guildData.role?.toString() === r.id,
      emoji: { id: recommendedRoleRegex.test(r.name) ? Emojis.mentionGreen.id : Emojis.mention.id }
    }))
  ]

  let text = '=settings_role_ui_2'
  if (!everyone || overflow) {
    text = Core.text(i.guildData, text)
      + '\n\n'
      + Core.text(i.guildData, everyone
        ? '=settings_role_list_hidden_overflow_disclaimer'
        : '=settings_role_list_hidden_permissions_disclaimer')
  }

  return {
    title: '=settings_role_ui_1',
    description: text,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_role_change',
        options,
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: '=generic_back',
        emoji: { id: Emojis.caretLeft.id }
      }
    ],
    footer: PermissionStrings.containsManageServer(i.member.permissions) ? '' : '=settings_permission_disclaimer'
  }
}
