import { CMS } from '@freestuffbot/common'
import { ReplyableComponentInteraction } from 'cordo'
import FreestuffGateway from '../../../services/freestuff-gateway'


export default function (i: ReplyableComponentInteraction) {
  i.state('admin_main', true)

  CMS.loadAll()
  FreestuffGateway.updateChannel('keep')
}
