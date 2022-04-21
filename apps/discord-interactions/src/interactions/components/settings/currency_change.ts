import { CMS, Errors } from '@freestuffbot/common'
import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  const [ err, currencies ] = CMS.currencies
  if (err) return Errors.handleErrorAndCommunicate(err, i)

  const currency = currencies.find(c => c.code === val)
  if (!currency) return i.ack()

  i.guildData.changeSetting('currency', currency)
  i.state('settings_display')
}
