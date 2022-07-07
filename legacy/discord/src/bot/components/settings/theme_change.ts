import { ReplyableComponentInteraction } from 'cordo'
import { Const } from '@freestuffbot/common'
import DatabaseManager from '../../database-manager'
import PermissionStrings from '../../../lib/permission-strings'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  const theme = Const.themes[parseInt(val, 10) || 0]

  DatabaseManager.changeSetting(i.guildData, 'theme', theme)
  i.state('settings_display')
}
