import { ReplyableComponentInteraction } from 'cordo'
import { CMS, Errors } from '@freestuffbot/common'
import PermissionStrings from 'cordo/dist/lib/permission-strings'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const vals = i.data.values
  if (!vals) return i.ack()

  const [ err, platforms ] = CMS.platforms
  if (err) return Errors.handleErrorAndCommunicate(err)

  const newList = platforms.filter(p => vals.includes(p.code))

  i.guildData.changeSetting('platforms', newList)
  i.state('settings_filter')
}
