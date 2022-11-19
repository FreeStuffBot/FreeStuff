

export type configjs = {
  port: number
  apiToken: string
  apiUser: string
  baseUrl: string
  globalRateLimit: number
  network: {
    umiAllowedIpRange: string
  }
  cacheTtlRestMin: number
  cacheTtlRestMax: number
  cacheTtlChannelsMin: number
  cacheTtlChannelsMax: number
  cacheTtlGuildMin: number
  cacheTtlGuildMax: number
  cacheTtlMemberMin: number
  cacheTtlMemberMax: number
  cachePurgeInterval: number
  webhookDefaultName: string
  webhookDefaultAvatar: string
}
