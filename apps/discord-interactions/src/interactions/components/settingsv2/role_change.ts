import { Long } from 'bson'
import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import DiscordGateway from '../../../services/discord-gateway'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  if (val === '0') {
    i.guildData.changeSetting('role', null)
  } else if (val === '1') {
    i.guildData.changeSetting('role', Long.fromInt(1))
  } else {
    const [ err, guild ] = await DiscordGateway.getGuild(i.guild_id)
    if (err) return i.ack()

    if (!guild.roles.some(r => r.id === val)) return i.ack()

    i.guildData.changeSetting('role', Long.fromString(val))
  }

  i.state('settings_role')
}
