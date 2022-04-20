import { ApiInterface, SanitizedProductType } from "@freestuffbot/common"


export default class ApiGateway {

  private static productsCache: Map<string | number, SanitizedProductType> = new Map()

  public static async getProductsById(ids: string[] | number[]): Promise<SanitizedProductType[]> {
    const out = await Promise.all(ids
      .map(async id => await ApiGateway.getProductById(id))
      .filter(p => !!p)
    )
    return out
  }

  public static async getProductById(id: string | number): Promise<SanitizedProductType> {
    if (ApiGateway.productsCache.has(id))
      return ApiGateway.productsCache.get(id)

    // const { data, status } = await ApiInterface.makeRequest('GET', 'v2', `/announcements/${id}?resolve=true`)

    // if (status !== 200) return null

    // const out = Object.values(data.resolved) as SanitizedProductType[]
    ApiGateway.productsCache.set(id, out)
    return out
  }

  //

  private static announcementsCache: Map<string | number, SanitizedProductType[]> = new Map()

  public static async getProductsForAnnouncement(id: string | number): Promise<SanitizedProductType[]> {
    if (ApiGateway.announcementsCache.has(id))
      return ApiGateway.announcementsCache.get(id)

    const { data, status } = await ApiInterface.makeRequest('GET', 'v2', `/announcements/${id}?resolve=true`)

    if (status !== 200) return null

    const out = Object.values(data.resolved) as SanitizedProductType[]
    ApiGateway.announcementsCache.set(id, out)
    for (const product of out)
      ApiGateway.productsCache.set(product.id, product)
    return out
  }

  //

  public static clearCaches() {
    ApiGateway.announcementsCache.clear()
  }

}
