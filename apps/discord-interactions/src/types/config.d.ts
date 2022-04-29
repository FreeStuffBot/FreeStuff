

export type configjs = {
  port: number
  discordClientId: string
  discordPublicKey: string
  mongoUrl: string
  rabbitUrl: string
  discordGuildCacheInterval: number
  discordChannelsCacheInterval: number
  discordWebhooksCacheInterval: number
  dataGuildCacheInterval: number
  userLimits: {
    refreshChannelsInterval: number
    refreshRolesInterval: number
  }
  network: {
    umiAllowedIpRange: string
    discordGateway: string
  }
  freestuffApi: {
    baseUrl: string
    auth: string
  }
}
