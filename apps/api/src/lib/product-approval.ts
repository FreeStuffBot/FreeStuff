import { CurrencyDataType, Logger, ProductType } from "@freestuffbot/common"
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
    product.data.urls.browser = proxyLink ?? product.data.urls.org
    product.data.urls.default = proxyLink ?? product.data.urls.org
    product.data.urls.client = ProductApproval.getClientUrl(product.data.urls.org)

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

  public static getClientUrl(httpUrl: string) {
    const isSteamUrl = /^https?:\/\/store\.steampowered\.com\/app\/.*/g.test(httpUrl)
    if (isSteamUrl) {
      try {
        const id = httpUrl.split('/app/')[1].split('/')[0]
        return `steam://store/${id}`
      } catch (ex) {
        Logger.info(`Failed creating the client url for steam with url ${httpUrl} for reason:`)
        // eslint-disable-next-line no-console
        console.log(ex)
      }
    }
  
    const isEpicUrl = /^https?:\/\/(www\.|store\.)?epicgames\.com\/.*$/g.test(httpUrl)
    if (isEpicUrl) {
      try {
        const data = httpUrl.split('/p/')[1].split('?')[0].replace(/\/home$/, '')
        return `com.epicgames.launcher://store/p/${data}`
      } catch (ex) {
        Logger.info(`Failed creating the client url for epic games with url ${httpUrl} for reason:`)
        // eslint-disable-next-line no-console
        console.log(ex)
      }
    }

    return null
  }

}
