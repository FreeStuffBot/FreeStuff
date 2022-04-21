import { CMS, Errors } from '@freestuffbot/common'
import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  if (!CMS.constants.currencies?.length)
    return Errors.handleErrorAndCommunicate(Errors.throwStderrNotInitialized('@currency_change::CMS.constants.currencies')[0], i)

  const id = parseInt(val, 10) || 0
  const currency = CMS.constants.currencies?.find(c => c.id === id) || CMS.constants.currencies[0]
  if (!currency) return i.ack()

  i.guildData.changeSetting('currency', currency)
  i.state('settings_display')
}
