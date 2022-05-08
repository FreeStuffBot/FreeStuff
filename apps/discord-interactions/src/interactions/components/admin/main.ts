import { CMS } from '@freestuffbot/common'
import { ReplyableComponentInteraction } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  const [ _, remoteConfig ] = CMS.remoteConfig
  const botAdmin = !!remoteConfig?.global.botAdmins.includes(i.user.id)
  if (!i.member || !botAdmin)
    return i.ack()

  i.state('admin_main')
}
