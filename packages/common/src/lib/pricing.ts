import { SanitizedGuildType } from "../models/guild.model"
import { SanitizedProductType } from "../models/product.model"


export default class Pricing {

  public static getLocalizedOldPrice(product: SanitizedProductType, guild: SanitizedGuildType) {
    if (!guild.currency) return false

    if (guild.currency) {
      const price = product.prices.find(p => p.currency === guild.currency.code)
      if (price) return price.oldValue
    }

    return product.prices[0]?.oldValue ?? 0
  }

}
