

export type CustomChannelPermissions = {
  sendMessages: boolean
  viewChannel: boolean
  manageWebhooks: boolean
  addReactions: boolean
  useExternalEmojis: boolean
  embedLinks: boolean
}

export class CustomPermissions {

  public static parseChannel(permissions: number): CustomChannelPermissions {
    return {
      sendMessages: (permissions & (1 << 0)) !== 0,
      viewChannel: (permissions & (1 << 1)) !== 0,
      manageWebhooks: (permissions & (1 << 2)) !== 0,
      addReactions: (permissions & (1 << 3)) !== 0,
      useExternalEmojis: (permissions & (1 << 4)) !== 0,
      embedLinks: (permissions & (1 << 5)) !== 0
    }
  }

}
