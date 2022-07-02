import { ProductDataType, ProductDiscountTypeType, ProductKindType } from "@freestuffbot/common"
import Mongo from "../../database/mongo"
import GibuGqlCore from "./gibu-gql-core"
import GibuGqlQueries from "./gibu-gql-queries"


export type GibuProcessedProduct = {
  uuid: string
  data: ProductDataType['data']
}

export default class GibuProductDetails {

  public static async getDetails(url: string, id: number): Promise<GibuProcessedProduct | null> {
    const data = await GibuGqlCore.query(GibuGqlQueries.PRODUCT_DETAILS, { url })
    if (!data) return null

    const thumbnail = GibuProductDetails.findBestThumbnail(data.images)
    const platform = await GibuProductDetails.gibuStoreToFsbPlatform(data.store)

    return {
      uuid: data.uuid,
      data: {
        id,
        title: data.title,
        prices: data.prices.map(price => ({
          currency: price.currency,
          oldValue: price.initial,
          newValue: price.final,
          converted: false
        })),
        kind: data.kind as ProductKindType,
        tags: data.tags,
        thumbnails: {
          org: thumbnail,
          blank: '',
          full: '',
          tags: ''
        },
        description: data.descriptionShort,
        rating: data.ratings[0]?.score ?? 0,
        until: data.sale.until,
        type: GibuProductDetails.parseType(data.sale.type),
        urls: {
          org: url,
          browser: url,
          default: url
        },
        platform,
        flags: 0,
        notice: null,
        platformMeta: {
          steamSubids: data.storeMeta.steamSubids ?? ''
        },
        staffApproved: false
      }
    }
  }

  private static findBestThumbnail(images: typeof GibuGqlQueries.PRODUCT_DETAILS.type['images']): string {
    if (!images?.length) return ''

    // round one - favourite picks
    for (const image of images) {
      if (image.name === 'background_landscape')
        return image.url
      if (image.name === 'landscape')
        return image.url
    }

    // round two - alternative picks
    for (const image of images) {
      if (image.name === 'trailer_thumbnail')
        return image.url
      if (image.name === 'thumbnail')
        return image.url
    }

    return images[0].url
  }

  private static parseType(inputType: string): ProductDiscountTypeType {
    if (inputType === 'free') return 'keep'
    if (inputType === 'timed') return 'timed'
    return 'other'
  }

  private static async gibuStoreToFsbPlatform(name: string): Promise<string> {
    const res = await Mongo.Platform
      .findOne({ gibuRef: name })
      .lean(true)
      .select({ code: 1 })
      .exec()
      .catch(() => null)

    if (!res) return ''

    return res.code
  }

}
