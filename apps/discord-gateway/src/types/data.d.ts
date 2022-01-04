

export type DataChannel = {
  id: string
  name: string
  type: number
  parent_id: string
  position: number
  topic: string
  nsfw: boolean
  permission_overwrites: {
    id: string
    type: number
    allow: string
    deny: string
  }[]
}
