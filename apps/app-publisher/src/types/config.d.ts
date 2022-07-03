

export type configjs = {
  port: number
  mongoUrl: string
  rabbitUrl: string
  network: {
    umiAllowedIpRange: string
  }
  behavior: {
    /** requests per frame */
    upstreamRequestRate: number
    /** frame size in ms */
    upstreamRequestInterval: number
    /** the amount of subtasks to split off */
    publishSplitTaskAmount: number
  }
  freestuffApi: {
    baseUrl: string
    auth: string
  }
  upstreamProxy: {
    baseUrl: string
    auth: string
  }
}
