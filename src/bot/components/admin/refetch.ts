import { ReplyableComponentInteraction } from 'cordo'
import AnnouncementManager from '../../announcement-manager'


export default function (i: ReplyableComponentInteraction) {
  i.ack()
  AnnouncementManager.updateCurrentFreebies()
}
