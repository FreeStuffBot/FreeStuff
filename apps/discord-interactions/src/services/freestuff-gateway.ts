import { ApiInterface, Errors, Fragile, Logger, ProductDiscountTypeType, SanitizedProductType } from "@freestuffbot/common"


export type EnhancedSanitizedProductType = SanitizedProductType & {
  today: boolean
}

export default class FreestuffGateway {

  private static readonly TWELVE_HOURS = 1000 * 60 * 60 * 12

  private static channelsCache: Map<ProductDiscountTypeType, EnhancedSanitizedProductType[]> = new Map()

  public static getChannel(name: ProductDiscountTypeType): Fragile<EnhancedSanitizedProductType[]> {
    if (FreestuffGateway.channelsCache.has(name))
      return Errors.success(FreestuffGateway.channelsCache.get(name))

    return Errors.throwStderrNotInitialized('discord-interactions::fsgateway.getchannel')
  }

  /**
   * Loads new data for the channel from the api
   * @param name Channel name
   * @returns whether successful
   */
  public static async updateChannel(name: ProductDiscountTypeType): Promise<boolean> {
    Logger.excessive('Updating current freebie list')
    
    const { data, status } = await ApiInterface.makeRequest('GET', 'v2', `/channels/${name}?resolve=true`)

    if (status !== 200) return false

    const products = Object.values(data.resolved) as SanitizedProductType[]

    const currentTime = Date.now()
    const out = products
      .filter(p => p.until && p.until > currentTime)
      .sort((a, b) => b.until - a.until) as EnhancedSanitizedProductType[]

    for (const p of out)
      p.today = (p.until - currentTime < this.TWELVE_HOURS)

    FreestuffGateway.channelsCache.set(name, out)
    return true
  }

}
