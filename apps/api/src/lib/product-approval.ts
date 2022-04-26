import { CurrencyDataType, ProductType } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import CurrConv from "../services/currconv"
import Thumbnailer from "../services/thumbnailer"


export default class ProductApproval {

  public static async completeProduct(product: ProductType, staffApproved: boolean): Promise<void> {
    product.data.staffApproved = staffApproved

    // thumbnail
    product.data.thumbnails = await Thumbnailer.generateObject({
      thumbnail: product.data.thumbnails.org,
      tags: product.data.tags
    }, false)

    // links

    // prices
    const currencies = await Mongo.Currency
      .find({})
      .lean(true)
      .exec()
      .catch(() => {}) as CurrencyDataType[]
    const usdPrice = product.data.prices.find(p => p.currency === 'usd')

    if (currencies && usdPrice) {
      for (const currency of currencies ?? []) {
        if (product.data.prices.find(p => p.currency === currency.code))
          continue
  
        const oldValue = CurrConv.convert(usdPrice.oldValue, currency.code)
        const newValue = CurrConv.convert(usdPrice.newValue, currency.code)
        if (oldValue === undefined || newValue === undefined)
          continue
  
        product.data.prices.push({
          currency: currency.code,
          converted: true,
          oldValue,
          newValue
        })
      }
    }
  }

}
