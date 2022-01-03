import { ReplyableComponentInteraction } from 'cordo'
import { reloadLanguages } from '../../..'
import AnnouncementManager from '../../announcement-manager'


export default function (i: ReplyableComponentInteraction) {
  i.state('admin_main', true)
  AnnouncementManager.updateCurrentFreebies()
  reloadLanguages()
}
