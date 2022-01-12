import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Errors from '../../../lib/errors'
import Tracker from '../../../lib/tracker'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return i.replyPrivately(Errors.handleErrorAndCommunicate(err))

  Tracker.set(guildData, 'ACTION_BETA_ENABLED_PREVIOUSLY')

  i.guildData.changeSetting('beta', !guildData.beta)
  i.state('settings_more')
}
