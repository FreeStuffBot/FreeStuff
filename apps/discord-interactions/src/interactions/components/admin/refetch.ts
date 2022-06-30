import { CMS, FSApiGateway } from '@freestuffbot/common'
import { ReplyableComponentInteraction } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  i.state('admin_main', true)

  CMS.loadAll()
  FSApiGateway.updateChannel('keep')
}
