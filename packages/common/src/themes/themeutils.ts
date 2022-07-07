import { Long } from 'bson'


export function roleIdToMention(id: Long): string {
  return id
    ? (id.toString() === '1')
      ? '@everyone'
      : `<@&${id.toString()}>`
    : ''
}
