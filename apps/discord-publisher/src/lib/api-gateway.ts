import { ApiInterface, SanitizedProductType } from "@freestuffbot/common"


export default class ApiGateway {

  private static announcementsCache: Map<string | number, SanitizedProductType[]> = new Map()

  public static async getProductsForAnnouncement(id: string | number): Promise<SanitizedProductType[]> {
    if (ApiGateway.announcementsCache.has(id))
      return ApiGateway.announcementsCache.get(id)

    const { data, status } = await ApiInterface.makeRequest('GET', 'v2', `/announcements/${id}?resolve=true`)

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
