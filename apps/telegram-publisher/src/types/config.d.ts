

export type configjs = {
  port: number
  rabbitUrl: string
  network: {
    umiAllowedIpRange: string
  }
  freestuffApi: {
    baseUrl: string
    auth: string
  }
}
