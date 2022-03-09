import { ProductType } from "@freestuffbot/common"
import GibuProductDetails from "../services/gibu/gibu-product-details"


export default class AutoScraper {

  public static async scrape(product: ProductType) {
    const data = await GibuProductDetails
      .getDetails(product.data.urls.org, product.data.id)
      .catch(console.error)

    if (!data) {
      product.uuid = `custom:${product._id}`
      product.status = 'pending'
      product.save()
      return
    }

    product.uuid = data.uuid
    product.data = data.data
    product.status = 'pending'
    product.save()
  }

}
