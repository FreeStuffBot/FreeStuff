import { ReplyableComponentInteraction } from 'cordo'
import { Localisation } from '@freestuffbot/common'
import DatabaseManager from '../../database-manager'
import PermissionStrings from '../../../lib/permission-strings'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  const id = Localisation.languageToId(val)
  if (id === -1) return i.ack()

  DatabaseManager.changeSetting(i.guildData, 'language', id)
  i.state('settings_language')
}
