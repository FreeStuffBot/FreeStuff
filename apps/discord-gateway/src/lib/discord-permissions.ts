import { DataChannel, DataGuild, DataMember } from "@freestuffbot/common"


type ChannelPermissionOverrides = {
  permission_overwrites: {
    id: string
    type: number
    allow: string
    deny: string  
  }[]
}

type PermissionsContainer = {
  sendMessages: boolean
  viewChannel: boolean
  manageWebhooks: boolean
  addReactions: boolean
  useExternalEmojis: boolean
  embedLinks: boolean
}

export function calculatePermissionsForMemberInChannel(member: DataMember, channel: DataChannel & ChannelPermissionOverrides, guild: DataGuild): PermissionsContainer {
  if (guild.ownerId === member.id) 
    return containerAllPermissions()

  const roles = guild.roles
    .filter(role => (member.roles.includes(role.id) || !role.position))
    .sort((a, b) => a.position - b.position)

  for (const role of roles) {
    role.permissionsInt = BigInt(role.permissions)
    if (hasBit(role.permissionsInt, BIT_ADMINISTRATOR))
      return containerAllPermissions()
  }

  const permissionsBase: PermissionsContainer = {
    sendMessages: false,
    viewChannel: false,
    manageWebhooks: false,
    addReactions: false,
    useExternalEmojis: false,
    embedLinks: false
  }

  for (const role of roles) {
    if (!permissionsBase.sendMessages && hasBit(role.permissionsInt, BIT_SEND_MESSAGES))
      permissionsBase.sendMessages = true
    if (!permissionsBase.viewChannel && hasBit(role.permissionsInt, BIT_VIEW_CHANNEL))
      permissionsBase.viewChannel = true
    if (!permissionsBase.manageWebhooks && hasBit(role.permissionsInt, BIT_MANAGE_WEBHOOKS))
      permissionsBase.manageWebhooks = true
    if (!permissionsBase.addReactions && hasBit(role.permissionsInt, BIT_ADD_REACTIONS))
      permissionsBase.addReactions = true
    if (!permissionsBase.useExternalEmojis && hasBit(role.permissionsInt, BIT_USE_EXTERNAL_EMOJIS))
      permissionsBase.useExternalEmojis = true
    if (!permissionsBase.embedLinks && hasBit(role.permissionsInt, BIT_EMBED_LINKS))
      permissionsBase.embedLinks = true
  }

  const overridesToCheck = [ member.id, ...roles.reverse().map(r => r.id) ]
  // permission_overwrites could be null if channel is a thread
  const overrides = channel.permission_overwrites
    ?.filter(f => overridesToCheck.includes(f.id))
    .map(f => ([ f, overridesToCheck.indexOf(f.id) ] as [ ChannelPermissionOverrides['permission_overwrites'][number], number ]))
    .sort((a, b) => (a[1] - b[1]))
    .map(f => f[0])
    ?? []

  const permissionsOverrides: PermissionsContainer = {
    sendMessages: null as boolean,
    viewChannel: null as boolean,
    manageWebhooks: null as boolean,
    addReactions: null as boolean,
    useExternalEmojis: null as boolean,
    embedLinks: null as boolean
  }

  let allow: bigint
  let deny: bigint
  for (const override of overrides) {
    allow = BigInt(override.allow)
    deny = BigInt(override.deny)

    if (permissionsOverrides.sendMessages === null) {
      if (hasBit(allow, BIT_SEND_MESSAGES))
        permissionsOverrides.sendMessages = true
      else if (hasBit(deny, BIT_SEND_MESSAGES))
        permissionsOverrides.sendMessages = false
    }

    if (permissionsOverrides.viewChannel === null) {
      if (hasBit(allow, BIT_VIEW_CHANNEL))
        permissionsOverrides.viewChannel = true
      else if (hasBit(deny, BIT_VIEW_CHANNEL))
        permissionsOverrides.viewChannel = false
    }

    if (permissionsOverrides.manageWebhooks === null) {
      if (hasBit(allow, BIT_MANAGE_WEBHOOKS))
        permissionsOverrides.manageWebhooks = true
      else if (hasBit(deny, BIT_MANAGE_WEBHOOKS))
        permissionsOverrides.manageWebhooks = false
    }

    if (permissionsOverrides.addReactions === null) {
      if (hasBit(allow, BIT_ADD_REACTIONS))
        permissionsOverrides.addReactions = true
      else if (hasBit(deny, BIT_ADD_REACTIONS))
        permissionsOverrides.addReactions = false
    }

    if (permissionsOverrides.useExternalEmojis === null) {
      if (hasBit(allow, BIT_USE_EXTERNAL_EMOJIS))
        permissionsOverrides.useExternalEmojis = true
      else if (hasBit(deny, BIT_USE_EXTERNAL_EMOJIS))
        permissionsOverrides.useExternalEmojis = false
    }

    if (permissionsOverrides.embedLinks === null) {
      if (hasBit(allow, BIT_EMBED_LINKS))
        permissionsOverrides.embedLinks = true
      else if (hasBit(deny, BIT_EMBED_LINKS))
        permissionsOverrides.embedLinks = false
    }
  }

  return {
    sendMessages: permissionsOverrides.sendMessages ?? permissionsBase.sendMessages,
    viewChannel: permissionsOverrides.viewChannel ?? permissionsBase.viewChannel,
    manageWebhooks: permissionsOverrides.manageWebhooks ?? permissionsBase.manageWebhooks,
    addReactions: permissionsOverrides.addReactions ?? permissionsBase.addReactions,
    useExternalEmojis: permissionsOverrides.useExternalEmojis ?? permissionsBase.useExternalEmojis,
    embedLinks: permissionsOverrides.embedLinks ?? permissionsBase.embedLinks
  }
}

export function containerToBitfield(permissions: PermissionsContainer) {
  let out = 0;
  if (permissions.sendMessages) out |= (1 << 0)
  if (permissions.viewChannel) out |= (1 << 1)
  if (permissions.manageWebhooks) out |= (1 << 2)
  if (permissions.addReactions) out |= (1 << 3)
  if (permissions.useExternalEmojis) out |= (1 << 4)
  if (permissions.embedLinks) out |= (1 << 5)
  return out
}

function containerAllPermissions(): PermissionsContainer {
  return {
    sendMessages: true,
    viewChannel: true,
    manageWebhooks: true,
    addReactions: true,
    useExternalEmojis: true,
    embedLinks: true
  }
}

const BIT_ADMINISTRATOR = 1n << 3n
const BIT_ADD_REACTIONS = 1n << 6n
const BIT_VIEW_CHANNEL = 1n << 10n
const BIT_SEND_MESSAGES = 1n << 11n
const BIT_EMBED_LINKS = 1n << 14n
const BIT_USE_EXTERNAL_EMOJIS = 1n << 18n
const BIT_MANAGE_WEBHOOKS = 1n << 29n

function hasBit(set: bigint, bit: bigint): boolean {
  return (set & bit) !== 0n
}
