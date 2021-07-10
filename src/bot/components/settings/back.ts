import { getBaseState } from '../../commands/settings'
import { ReplyableComponentInteraction } from '../../../cordo/types/ibase'
import { GuildData } from '../../../types/datastructs'


export default function (i: ReplyableComponentInteraction, data: GuildData) {
  i.edit(getBaseState(data))
}
