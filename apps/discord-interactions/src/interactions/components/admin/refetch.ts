import { ReplyableComponentInteraction } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  i.state('admin_main', true)
  // TODO
  // AnnouncementManager.updateCurrentFreebies()
  // reloadLanguages()
}
