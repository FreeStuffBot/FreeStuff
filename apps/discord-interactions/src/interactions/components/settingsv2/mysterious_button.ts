import { Errors } from '@freestuffbot/common'
import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Tracker from '../../../lib/tracker'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return i.replyPrivately(Errors.handleErrorAndCommunicate(err))

  Tracker.set(guildData, 'ACTION_MYSTERIOUS_BUTTON_CLICKED')

  i.replyPrivately({
    content: 'Check back soon, there\'s no mystery here yet :eyes:'
  })
}
