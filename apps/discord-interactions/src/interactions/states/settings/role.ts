import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponentSelectOption } from 'cordo'
import { DataGuild, Emojis, Errors, Localisation, SanitizedGuildType } from '@freestuffbot/common'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Tracker from '../../../lib/tracker'
import DiscordGateway from '../../../services/discord-gateway'


type Options = {
  ignoreCache?: boolean
}

type DataRole = DataGuild['roles'][number]

//

const recommendedRoleRegex = /free|game|deal|ping|notification/i

export default async function (i: GenericInteraction, [ opts ]: [ Options ]): Promise<InteractionApplicationCommandCallbackData> {
  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return Errors.handleErrorAndCommunicate(err)

  Tracker.set(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_ROLE')

  const [ error, guild ] = await DiscordGateway.getGuild(i.guild_id, !!opts?.ignoreCache)
  if (error) return Errors.handleErrorAndCommunicate(error)

  const roles = guild.roles
    .map(r => [ r, recommendRole(r, guildData) ] as [ DataRole, number ])
    .filter(([ r ]) => (r.name !== '@everyone' && !r.managed))
    .sort((a, b) => (b[0].position + b[1]) - (a[0].position + a[1]))

  const overflow = roles.length > 23

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
    ...roles
      .slice(0, 23)
      .map(([ role, reco ]) => ({
        label: sanitizeRoleName(role.name, 25),
        value: role.id,
        default: guildData.role?.toString() === role.id,
        emoji: (reco > 0)
          ? Emojis.mentionGreen.toObject()
          : Emojis.mention.toObject()
      }))
  ]

  let text = '=settings_role_ui_2'
  if (overflow) {
    text = Localisation.text(i, text)
      + '\n\n'
      + Localisation.text(i, '=settings_role_list_hidden_overflow_disclaimer')

      // + Localisation.text(i, everyone
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
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'meta_refresh_roles',
        label: '=refresh_role_list'
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

/** returns a number that indicates how much to recommend this role */
function recommendRole(role: DataRole, guild: SanitizedGuildType): number {
  if (guild.role?.toString() === role.id) return 1200
  if (recommendedRoleRegex.test(role.name)) return 1000
  return 0
}
