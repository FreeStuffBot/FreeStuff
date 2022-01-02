import { Long } from 'mongodb'


export function roleIdToMention(id: Long): string {
  return id
    ? ((id + '') === '1')
      ? '@everyone'
      : `<@&${id}>`
    : ''
}
