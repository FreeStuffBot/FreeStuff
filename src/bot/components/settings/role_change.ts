import { Core } from '../../../index'
import { ReplyableComponentInteraction } from '../../../cordo/types/ibase'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  const guild = await Core.guilds.fetch(i.guild_id)
  if (val === '0') {
    await Core.databaseManager.changeSetting(i.guildData, 'role', '0')
  } else if (val === '1') {
    await Core.databaseManager.changeSetting(i.guildData, 'role', '1')
  } else {
    const role = await guild.roles.fetch(val)
    if (!role) return i.ack()
    await Core.databaseManager.changeSetting(i.guildData, 'role', role.id)
  }

  i.state('settings_role')
}
