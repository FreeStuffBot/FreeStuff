import { ReplyableComponentInteraction } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  i.edit({
    description: '=generic_cancelled',
    components: []
  })
}
