

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
    /** maximum amount of times to try to re-publish a failed request */
    upstreamMaxRetries: number
    /** how many frames worth of requests are allowed in the queue before asking suppliers to wait */
    upstreamMaxFramesInQueue: number
    /** maximum amount of requests that can be sent but haven't been answered yet before blocking */
    upstreamMaxPendingReplyCount: number
    /** timeframe in which client errors are measured */
    upstreamClientErrorsTimeframeMinutes: number
    /** max amount of client errors tolerated within the given timeframe */
    upstreamClientErrorsMax: number
    /** how many percent of the max errors have to be reached in order to take action. 1 (100%) would mean stretching it to the limit */
    upstreamClientErrorActionLeeway: number
    /** the amount of subtasks to split off */
    publishSplitTaskAmount: number
    /** the amount of requests to queue until waiting for the queue to clear up */
    publishTaskBatchSize: number
  }
  freestuffApi: {
    baseUrl: string
    auth: string
  }
}
