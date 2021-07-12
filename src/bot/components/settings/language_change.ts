import { Core } from '../../../index'
import { ReplyableComponentInteraction } from '../../../cordo/types/ibase'
import LanguageManager from '../../language-manager'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  const id = LanguageManager.languageToId(val)
  if (id === -1) return i.ack()

  const guild = await Core.guilds.fetch(i.guild_id)
  await Core.databaseManager.changeSetting(guild, i.guildData, 'language', id)
  i.state('settings_language')
}
