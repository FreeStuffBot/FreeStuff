import { ApiInterface, SanitizedProductType } from "@freestuffbot/common"


export default class FreestuffGateway {

  private static productsCache: Map<string | number, SanitizedProductType> = new Map()

  public static async getProductsByIds(ids: string[] | number[]): Promise<SanitizedProductType[]> {
    const out = await Promise.all(ids
      .map(async id => await FreestuffGateway.getProductById(id))
      .filter(p => !!p)
    )
    return out
  }

  public static async getProductById(id: string | number): Promise<SanitizedProductType> {
    if (FreestuffGateway.productsCache.has(id))
      return FreestuffGateway.productsCache.get(id)

    const { data, status } = await ApiInterface.makeRequest('GET', 'v2', `/products/${id}`)

    if (status !== 200) return null

    FreestuffGateway.productsCache.set(id, data)
    return data
  }

  //

  private static announcementsCache: Map<string | number, SanitizedProductType[]> = new Map()

  public static async getProductsForAnnouncement(id: string | number): Promise<SanitizedProductType[]> {
    if (FreestuffGateway.announcementsCache.has(id))
      return FreestuffGateway.announcementsCache.get(id)

    const { data, status } = await ApiInterface.makeRequest('GET', 'v2', `/announcements/${id}?resolve=true`)

    if (status !== 200) return null

    const out = Object.values(data.resolved) as SanitizedProductType[]
    FreestuffGateway.announcementsCache.set(id, out)
    for (const product of out)
      FreestuffGateway.productsCache.set(product.id, product)
    return out
  }

  //

  public static clearCaches() {
    FreestuffGateway.productsCache.clear()
    FreestuffGateway.announcementsCache.clear()
  }

}
