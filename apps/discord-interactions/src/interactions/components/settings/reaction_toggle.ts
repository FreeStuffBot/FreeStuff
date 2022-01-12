import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Errors from '../../../lib/errors'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return i.replyPrivately(Errors.handleErrorAndCommunicate(err))

  i.guildData.changeSetting('react', !guildData.react)
  i.state('settings_display')
}
