import { ReplyableComponentInteraction } from 'cordo'
import { Core } from '../../../index'
import LanguageManager from '../../language-manager'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  const id = LanguageManager.languageToId(val)
  if (id === -1) return i.ack()

  await Core.databaseManager.changeSetting(i.guildData, 'language', id)
  i.state('settings_language')
}
