import { ReplyableComponentInteraction } from 'cordo'
import AnnouncementManager from '../../announcement-manager'
import LanguageManager from '../../language-manager'


export default function (i: ReplyableComponentInteraction) {
  i.state('admin_main', true)
  AnnouncementManager.updateCurrentFreebies()
  LanguageManager.load()
}
