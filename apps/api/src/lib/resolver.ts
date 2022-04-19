import { ProductDataType } from "@freestuffbot/common"
import Mongo from "../database/mongo"


export default class Resolver {

  private static productCache: Map<number, ProductDataType> = new Map()

  public static async resolveProduct(id: number): Promise<ProductDataType> {
    if (Resolver.productCache.has(id))
      return Resolver.productCache.get(id)
    
    const data = await Mongo.Product
      .findById(id)
      .lean(true)
      .exec()
      .catch(() => {})

    Resolver.productCache.set(id, data)
    return data
  }

  //

  public static clearCache() {
    Resolver.productCache.clear()
  }

}
