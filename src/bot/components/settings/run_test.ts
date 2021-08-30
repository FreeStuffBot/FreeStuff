import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from '../../../lib/permission-strings'
import Tracker from '../../tracker'
import MessageDistributor from '../../message-distributor'
import Const from '../../const'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  Tracker.set(i.guildData, 'ACTION_TEST_TRIGGERED')

  i.ack()
  MessageDistributor.test(i.guild_id, Const.testAnnouncementContent)
}
