

export type DataGuilddata = {
  id: string
  name: string
  type: number
  parentId: string
  position: number
  topic: string
  nsfw: boolean
  /** send, view, webhooks, reactions, emojis */
  permissions: number
}
