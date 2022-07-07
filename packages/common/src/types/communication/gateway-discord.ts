

export type DataChannel = {
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

export type DataGuild = {
  id: string
  name: string
  icon: string
  description: string
  ownerId: string
  roles: {
    id: string
    name: string
    permissions: string
    permissionsInt: bigint
    managed: boolean
    position: number
    mentionable: boolean
    icon: string | null
    unicodeEmoji: string | null
  }[]
  preferredLocale: string
  rulesChannelId: string | null
  systemChannelId: string | null
  publicUpdatesChannelId: string | null
}

export type DataMember = {
  id: string
  roles: string[]
}

export type DataWebhook = {
  id: string
  name: string
  avatar: string
  token: string
}
