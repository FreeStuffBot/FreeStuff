import { SanitizedGuildType, SanitizedProductType } from "@freestuffbot/common"


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
    if (product.)
  }

}
