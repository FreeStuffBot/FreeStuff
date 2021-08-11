import { ReplyableComponentInteraction } from 'cordo'
import DatabaseManager from '../../database-manager'
import Const from '../../const'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  const theme = Const.themes[parseInt(val) || 0]

  await DatabaseManager.changeSetting(i.guildData, 'theme', theme)
  i.state('settings_display')
}
