

export type configjs = {
  port: number
  discordClientId: string
  discordPublicKey: string
  mongoUrl: string
  discordGuildCacheInterval: number
  discordChannelsCacheInterval: number
  discordWebhooksCacheInterval: number
  dataGuildCacheInterval: number
  userLimits: {
    refreshChannelsInterval: number
    refreshRolesInterval: number
  }
  network: {
    discordGateway: string
  }
}
