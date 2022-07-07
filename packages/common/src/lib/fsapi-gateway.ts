import { ApiInterface, Errors, Fragile, Logger, ProductDiscountTypeType, ProductDiscountTypeArray, SanitizedProductType } from ".."


export type EnhancedSanitizedProductType = SanitizedProductType & {
  today: boolean
}

export default class FSApiGateway {

  private static readonly TWELVE_HOURS = 1000 * 60 * 60 * 12

  //#region CHANNELS

  private static channelsCache: Map<ProductDiscountTypeType, EnhancedSanitizedProductType[]> = new Map()
  private static channelsInitialized: Set<ProductDiscountTypeType> = new Set()

  public static getChannel(name: ProductDiscountTypeType): Fragile<EnhancedSanitizedProductType[]> {
    if (FSApiGateway.channelsCache.has(name))
      return Errors.success(FSApiGateway.channelsCache.get(name))

    return Errors.throwStderrNotInitialized('discord-interactions::fsgateway.getchannel')
  }

  /**
   * Loads new data for the channel from the api
   * @param name Channel name
   * @param noInit If set to true will only fetch the channel if is has been initialized before
   * @returns whether successful
   */
  public static async updateChannel(name: ProductDiscountTypeType | '*', noInit = false): Promise<boolean> {
    Logger.excessive(`Updating fs channel ${name}`)

    if (name === '*') {
      for (const channel of ProductDiscountTypeArray as ProductDiscountTypeType[])
          FSApiGateway.updateChannel(channel)
      return
    }

    if (!FSApiGateway.channelsInitialized.has(name)) {
      if (noInit) return
      FSApiGateway.channelsInitialized.add(name)
    }

    const { data, status } = await ApiInterface.makeRequest('GET', 'v2', `/channels/${name}?resolve=true`)

    if (status !== 200) return false

    const products = Object.values(data.resolved) as SanitizedProductType[]

    const currentTime = Date.now()
    const out = products
      .filter(p => p.until && p.until > currentTime)
      .sort((a, b) => b.until - a.until) as EnhancedSanitizedProductType[]

    for (const p of out)
      p.today = (p.until - currentTime < this.TWELVE_HOURS)

    FSApiGateway.channelsCache.set(name, out)
    return true
  }

  //#endregion

  //#region PRODUCTS

  private static productsCache: Map<string | number, SanitizedProductType> = new Map()

  public static async getProductsByIds(ids: string[] | number[]): Promise<SanitizedProductType[]> {
    const out = await Promise.all(ids
      .map(async id => await FSApiGateway.getProductById(id))
      .filter(p => !!p)
    )
    return out
  }

  public static async getProductById(id: string | number): Promise<SanitizedProductType> {
    if (FSApiGateway.productsCache.has(id))
      return FSApiGateway.productsCache.get(id)

    const { data, status } = await ApiInterface.makeRequest('GET', 'v2', `/products/${id}`)

    if (status !== 200) return null

    FSApiGateway.productsCache.set(id, data)
    return data
  }

  public static clearProductsCache(id: string | number = '*') {
    if (id === '*') FSApiGateway.productsCache.clear()
    else FSApiGateway.productsCache.delete(id)
  }

  //#endregion

  //#region ANNOUNCEMENTS

  private static announcementsCache: Map<string | number, SanitizedProductType[]> = new Map()

  public static async getProductsForAnnouncement(id: string | number): Promise<SanitizedProductType[]> {
    if (FSApiGateway.announcementsCache.has(id))
      return FSApiGateway.announcementsCache.get(id)

    const { data, status } = await ApiInterface.makeRequest('GET', 'v2', `/announcements/${id}?resolve=true`)

    if (status !== 200) return null

    const out = Object.values(data.resolved) as SanitizedProductType[]
    FSApiGateway.announcementsCache.set(id, out)
    for (const product of out)
    FSApiGateway.productsCache.set(product.id, product)
    return out
  }

  public static clearAnnouncementsCache(id: string | number = '*') {
    if (id === '*') FSApiGateway.announcementsCache.clear()
    else FSApiGateway.announcementsCache.delete(id)
  }

  //#endregion

  //#region util

  public static clearOrRefetchAll() {
    FSApiGateway.updateChannel('*', true)
    FSApiGateway.clearProductsCache()
    FSApiGateway.clearAnnouncementsCache()
  }

  //#endregion

}
