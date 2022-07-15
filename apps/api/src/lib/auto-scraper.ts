import { ProductType } from "@freestuffbot/common"
import GibuProductDetails, { GibuProcessedProduct } from "../services/gibu/gibu-product-details"


export default class AutoScraper {

  public static async scrape(product: ProductType, url: string, merge: boolean) {
    const data = await GibuProductDetails
      .getDetails(url, product.data.id)
      // eslint-disable-next-line no-console
      .catch(console.error)

    if (!data) {
      // if we want to merge but didnt find anything new: return
      if (merge) return

      product.uuid = `custom:${product._id}`
      product.status = 'pending'
      await product.save()
      return
    }

    // only use new uuid if overwritten
    if (merge) {
      AutoScraper.mergeData(product.data, data.data)
    } else {
      product.uuid = data.uuid
      product.data = data.data
    }

    product.status = 'pending'
    await product.save()
  }

  private static mergeData(product: ProductType['data'], newData: GibuProcessedProduct['data']): void {
    for (const [ k, v ] of Object.entries(newData)) {
      if (!v) continue
      if (product[k]) continue

      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        product[k] = v
        continue
      }

      if (typeof v !== 'object') continue

      if ('length' in v) {
        if (!product[k]) product[k] = []
        for (const item in v as any[])
          product[k].push(item)
        continue
      }

      if (!product[k]) product[k] = {}
      for (const [ nK, nV ] of Object.entries(v))
        product[k][nK] = nV
    }
  }

}
