import { ReplyableComponentInteraction } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  const dest = i.params.destination
  if (!dest) i.ack()
  // TODO
  i.state(dest.replace(/-/g, '_'))
}
