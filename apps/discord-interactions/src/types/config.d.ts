

export type configjs = {
  port: number
  discordClientId: string
  discordPublicKey: string
  mongoUrl: string
  discordGuildCacheInterval: number
  discordChannelsCacheInterval: number
  discordWebhooksCacheInterval: number
  dataGuildCacheInterval: number
  network: {
    discordGateway: string
  }
}
