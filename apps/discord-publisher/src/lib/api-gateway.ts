import { SanitizedProductType } from "@freestuffbot/common"
import axios from "axios"
import * as os from "os"
import { config } from ".."


export default class ApiGateway {

  private static announcementsCache: Map<string | number, SanitizedProductType[]> = new Map()

  public static async getProductsForAnnouncement(id: string | number): Promise<SanitizedProductType[]> {
    if (ApiGateway.announcementsCache.has(id))
      return ApiGateway.announcementsCache.get(id)

    const { data, status } = await axios.get(`/v2/announcements/${id}?resolve=true`, {
      baseURL: config.freestuffApi.baseUrl,
      headers: {
        Authorization: `Partner ${config.freestuffApi.auth} ${os.hostname()}`,
        Accept: 'application/json'
      },
      validateStatus: null
    })

    if (status !== 200) return null

    const out = Object.values(data.resolved) as SanitizedProductType[]
    ApiGateway.announcementsCache.set(id, out)
    return out
  }

  //

  public static clearCaches() {
    ApiGateway.announcementsCache.clear()
  }

}
