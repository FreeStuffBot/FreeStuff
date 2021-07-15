import { ReplyableComponentInteraction } from 'cordo'
import { Core } from '../../../index'
import Const from '../../const'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  const theme = Const.themes[parseInt(val) || 0]

  await Core.databaseManager.changeSetting(i.guildData, 'theme', theme)
  i.state('settings_display')
}
