import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { config } from ".."


export default class Upstream {

  private static readonly BURST_INTERVAL = 1000

  private static queue = [] as AxiosRequestConfig[]

  public static queueRequest(req: AxiosRequestConfig): void {
    Upstream.queue.push(req)

    // TODO(high)
    // make async
    // await BURST_INTERVAL ms while queue.size > config.behavior.upstreamRequestRate
  }

  public static burst() {
    if (!Upstream.queue.length) return
    const out = Upstream.queue.splice(0, config.behavior.upstreamRequestRate)
    for (const req of out) {
      axios(req)
        .catch(err => err?.response ?? {})
        .then(Upstream.handleResponse)
    }
  }

  private static handleResponse(res: AxiosResponse) {
    // TODO(medium) handle status
    // • log it to prometheus
    // • handle rate limits properly
    console.log('http ', res.status)
  }

  public static startBurstInterval() {
    setInterval(() => {
      Upstream.burst()
    }, Upstream.BURST_INTERVAL)
  }

}
