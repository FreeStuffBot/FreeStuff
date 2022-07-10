import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { config } from ".."
import Metrics from "./metrics"


export default class Upstream {

  /** the remaining packets in this frame */
  private static remaining = 0
  /** ms timestamp of the start of next frame */
  private static nextFrame = 0
  /** whether we are currently blocked (rate limits) */
  private static blocked = false
  /** amount of packages waiting in line */
  private static waiting = 0
  /** to prevent the burst timer from being started twice */
  private static burstStarted = false

  public static async queueRequest(req: AxiosRequestConfig): Promise<void> {
    Upstream.waiting++

    const nextAvailableFrame = ~~(Upstream.waiting / config.behavior.upstreamRequestRate) + 1
    let hasWaited = false

    while (true) {
      // if we are rate limited, wait for one frame
      while (Upstream.blocked)
        await Upstream.sleepUntilNextFrame()

      // if this packet has not waited yet but there are so many others waiting that they
      // dont all fit in one frame this packet got lucky and for fairness has to wait too
      if (!hasWaited && Upstream.waiting > config.behavior.upstreamRequestRate)
        await Upstream.sleepUntilNextFrame(nextAvailableFrame)

      // if there's space in the current frame, great, burst
      if (Upstream.remaining > 0) {
        Upstream.burst(req)
        return
      }

      // else wait for the next frame, maybe skip some if the queue is full
      await Upstream.sleepUntilNextFrame(hasWaited ? 0 : nextAvailableFrame)
      hasWaited = true
    }
  }

  private static burst(req: AxiosRequestConfig) {
    Upstream.remaining--
    Upstream.waiting--

    axios(req)
      .catch(err => err?.response ?? { status: 999 })
      .then(res => Upstream.handleResponse(res, req))
  }

  private static handleResponse(res: AxiosResponse, _retryConfig: AxiosRequestConfig) {
    const status = res?.status ?? 998
    Metrics.counterUpstreamStatus.inc({ status })
    console.log('status -> ', status)

    if (status >= 400 && status < 600) {
      // TODO (low) resend in increasing intervals if not 200
      // warn users before-hand that this change will be made and that all webhook requests should be answered with a 200 code
    }
  }

  public static startBurstInterval() {
    if (Upstream.burstStarted) return
    Upstream.burstStarted = true
    setInterval(() => {
      Upstream.remaining = config.behavior.upstreamRequestRate
      Upstream.nextFrame = Date.now() + config.behavior.upstreamRequestInterval + 1 // +1 to encounter timing hiccups
    }, config.behavior.upstreamRequestInterval)
  }

  //

  /**
   * Wait for the next frame (or a frame further down the line)
   * @param skipAmount skip extra frames in advance
   * @returns resolved promise
   */
  private static sleepUntilNextFrame(skipAmount = 0): Promise<void> {
    const delta
      = Upstream.nextFrame - Date.now()
      + skipAmount * config.behavior.upstreamRequestInterval

    if (delta <= 0) return Promise.resolve()
    return new Promise(res => setTimeout(res, delta))
  }

}
