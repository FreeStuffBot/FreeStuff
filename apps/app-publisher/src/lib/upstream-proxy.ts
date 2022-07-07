import { SanitizedAppType } from "@freestuffbot/common"
import { config } from ".."
import Upstream from "./upstream"

export default class UpstreamProxy {

  public static sendTo(payload: any, app: SanitizedAppType): void {
    Upstream.queueRequest({
      method: 'POST',
      url: config.upstreamProxy.baseUrl,
      data: payload,
      headers: {
        'X-Dest': app.webhookUrl,
        'X-Auth': config.upstreamProxy.auth
      }
    })
  }

}
