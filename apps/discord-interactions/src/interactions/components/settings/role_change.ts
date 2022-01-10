import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  if (val === '0') {
    i.guildData.changeSetting('role', null)
  } else if (val === '1') {
    i.guildData.changeSetting('role', '1')
  } else {
    // TODO validate role id
    // const role = await guild.roles.fetch(val)
    // if (!role) return i.ack()
    // i.guildData.changeSetting('role', role.id)
    i.guildData.changeSetting('role', val)
  }

  i.state('settings_role')
}
