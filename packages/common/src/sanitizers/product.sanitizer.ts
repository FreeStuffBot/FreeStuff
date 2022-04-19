import { ProductDataType, SanitizedProductType } from "../models/product.model"


export class ProductSanitizer {

  public static sanitize(data: ProductDataType): SanitizedProductType {
    if (!data) return null
    return data.data
  }

}
