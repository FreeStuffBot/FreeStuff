import { CurrencyDataType, ProductType } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import CurrConv from "../services/currconv"
import LinkProxy from "../services/link-proxy"
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
    const leanProduct = product.toObject({ aliases: false, depopulate: true, flattenMaps: true, getters: false, minimize: true, useProjection: false, versionKey: false, virtuals: false })
    const proxyLink = await LinkProxy.createGameLink(leanProduct)
    product.data.urls.browser = proxyLink
    product.data.urls.default = proxyLink
    // TODO product.data.urls.client = TODO

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
