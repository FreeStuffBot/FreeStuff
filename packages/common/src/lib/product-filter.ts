import { SanitizedGuildType } from "../models/guild.model"
import { SanitizedProductType } from "../models/product.model"
import { ProductFlag } from "../types/other/product-flag"
import Pricing from "./pricing"


export default class ProductFilter {

  public static filterList(products: SanitizedProductType[], config: SanitizedGuildType): SanitizedProductType[] {
    const out = []
    for (const product of products) {
      if (ProductFilter.isPassing(product, config))
        out.push(product)
    }
    return out
  }

  public static isPassing(product: SanitizedProductType, config: SanitizedGuildType): boolean {
    return !!product
      && ProductFilter.passesTrashFilter(product, config)
      && ProductFilter.passesPriceFilter(product, config)
      && ProductFilter.passesPlatformFilter(product, config)
  }

  private static passesTrashFilter(product: SanitizedProductType, config: SanitizedGuildType): boolean {
    return config.trashGames || (product.flags & ProductFlag.TRASH) === 0
  }

  private static passesPriceFilter(product: SanitizedProductType, config: SanitizedGuildType): boolean {
    if (config.price.from <= 0) return true
    const price = Pricing.getLocalizedOldPrice(product, config)
    return price >= config.price.from
  }

  private static passesPlatformFilter(product: SanitizedProductType, config: SanitizedGuildType): boolean {
    if (!config.platformsList?.length) return false
    return config.platformsList.some(p => p.code === product.platform)
  }

}
