import { ReplyableComponentInteraction } from '../../../cordo/types/ibase'


export default function (i: ReplyableComponentInteraction) {
  console.log(i.data.values)
  i.ack()
}
