

export type configjs = {
  port: number
  apiToken: string
  apiUser: string
  baseUrl: string
  globalRateLimit: number
  network: {
    umiAllowedIpRange: string
  }
  cacheTtlChannelsMin: number
  cacheTtlChannelsMax: number
  cacheTtlGuildMin: number
  cacheTtlGuildMax: number
  cacheTtlMemberMin: number
  cacheTtlMemberMax: number
  webhookDefaultName: string
  webhookDefaultAvatar: string
}
