import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponentSelectOption } from 'cordo'
import { DataGuild, Emojis, Localisation } from '@freestuffbot/common'
import Tracker from '../../../lib/tracker'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Errors from '../../../lib/errors'
import DiscordGateway from '../../../services/discord-gateway'


type DataRole = DataGuild['roles'][number]

const recommendedRoleRegex = /free|game|deal|ping|notification/i

export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return Errors.handleErrorAndCommunicate(err)

  Tracker.set(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_ROLE')

  const [ error, guild ] = await DiscordGateway.getGuild(i.guild_id)
  if (error) return Errors.handleErrorAndCommunicate(error)

  const roles = guild.roles
    .map(r => [ r, recommendedRoleRegex.test(r.name) ] as [ DataRole, boolean ])
    .sort((a, b) =>
      (a[1] ? 999 : 0) - (b[1] ? 999 : 0)
      + (b[0].position - a[0].position)
    )
    .filter(([r]) => (r.name !== '@everyone' && !r.managed))
    .slice(0, 23)

  const overflow = guild.roles.length > 23

  const options: MessageComponentSelectOption[] = [
    {
      label: '=settings_role_list_no_mention_1',
      value: '0',
      default: !guildData.role || guildData.role?.toString() === '0',
      description: '=settings_role_list_no_mention_2',
      emoji: Emojis.no.toObject()
    },
    {
      label: '=settings_role_list_everyone_1',
      value: '1',
      default: guildData.role?.toString() === '1',
      description: '=settings_role_list_everyone_2',
      emoji: Emojis.global.toObject()
    },
    ...roles.map(([r]) => ({
      label: sanitizeRoleName(r.name, 25),
      value: r.id,
      default: guildData.role?.toString() === r.id,
      emoji: recommendedRoleRegex.test(r.name)
        ? Emojis.mentionGreen.toObject()
        : Emojis.mention.toObject()
    }))
  ]

  let text = '=settings_role_ui_2'
  if (overflow) {
    text = Localisation.text(guildData, text)
      + '\n\n'
      + Localisation.text(guildData, '=settings_role_list_hidden_permissions_disclaimer')

      // + Localisation.text(guildData, everyone
      //     ? '=settings_role_list_hidden_overflow_disclaimer'
      //     : '=settings_role_list_hidden_permissions_disclaimer'
      //   )
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
        emoji: Emojis.caretLeft.toObject()
      }
    ],
    footer: PermissionStrings.containsManageServer(i.member.permissions) ? '' : '=settings_permission_disclaimer'
  }
}

function sanitizeRoleName(name: string, maxlength: number): string {
  if (name.length < maxlength) return name

  name = name.substring(0, maxlength)
  if (name.split('').some(n => n.charCodeAt(0) > 0xFF))
    // eslint-disable-next-line no-control-regex
    name = name.replace(/((?:[\0-\x08\x0B\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g, '')

  return name
}
