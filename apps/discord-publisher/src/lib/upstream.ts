import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { config } from ".."


export default class Upstream {

  private static queue = [] as AxiosRequestConfig[]

  public static queueRequest(req: AxiosRequestConfig): void {
    Upstream.queue.push(req)
  }

  public static burst() {
    if (!Upstream.queue.length) return
    const out = Upstream.queue.splice(0, config.behavior.upstreamRequestRate)
    for (const req of out)
      axios(req).then(Upstream.handleResponse)
  }

  private static handleResponse(res: AxiosResponse) {
    // TODO handle status
    // • log it to prometheus
    // • handle rate limits properly
    console.log('http ', res.status)
  }

  public static startBurstInterval() {
    setInterval(() => {
      Upstream.burst()
    }, 1000)
  }

}
