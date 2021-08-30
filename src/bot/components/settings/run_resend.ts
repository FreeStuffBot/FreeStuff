import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from '../../../lib/permission-strings'
import Tracker from '../../tracker'
import MessageDistributor from '../../message-distributor'
import Const from '../../const'
import AnnouncementManager from '../../announcement-manager'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  Tracker.set(i.guildData, 'ACTION_RESEND_TRIGGERED')

  const freebies = AnnouncementManager.getCurrentFreebies()
  if (!freebies?.length) {
    i.replyPrivately({
      title: '=cmd_resend_nothing_free_1',
      description: '=cmd_resend_nothing_free_2',
      _context: {
        discordInvite: Const.links.supportInvite
      }
    })
    return
  }

  i.ack()
  MessageDistributor.sendToGuild(i.guildData, freebies, false, false)
}
