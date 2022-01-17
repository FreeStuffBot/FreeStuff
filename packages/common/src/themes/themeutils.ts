import { Schema } from "mongoose"


export function roleIdToMention(id: Schema.Types.Long): string {
  return id
    ? ((id + '') === '1')
      ? '@everyone'
      : `<@&${id}>`
    : ''
}
