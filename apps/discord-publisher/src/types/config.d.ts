

export type configjs = {
  mongoUrl: string
  rabbitUrl: string
  behavior: {
    /** requests per second */
    upstreamRequestRate: number
    /** the amount of subtasks to split off */
    publishSplitTaskAmount: number
  }
  freestuffApi: {
    baseUrl: string
    auth: string
  }
}
