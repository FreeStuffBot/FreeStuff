import { createNewProduct, Logger, NestedLogger, PlatformDataType, PlatformSanitizer, ProductType, SanitizedPlatformType } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import AutoScraper from "../lib/auto-scraper"
import LocalConst from "../lib/local-const"
import ProductApproval from "../lib/product-approval"
import Utils from "../lib/utils"
import GibuGqlCore from "../services/gibu/gibu-gql-core"
import GibuGqlQueries from "../services/gibu/gibu-gql-queries"


export default class FetchFreebiesRoutine {

  public static async run(_logger: NestedLogger) {
    const platformMapping = await FetchFreebiesRoutine.fetchGibuPlatformMapping()
    if (!platformMapping)
      return 'Failed to load platform mapping. Canceling routine.'

    const gibuList = await GibuGqlCore.query(GibuGqlQueries.FREE_GAMES_LIST, {})
    if (!gibuList)
      return 'Failed to load gibu games list. Canceling routine.'

    const games: typeof gibuList['items'] = []
    for (const item of gibuList.items) {
      if (!platformMapping.has(item.store)) continue
      if (item.type !== 'discount') continue

      const known = await FetchFreebiesRoutine.isAlreadyKnown(item.uuid)
      if (known) continue

      games.push(item)
    }

    Logger.info(`Found ${games.length} new games`)

    for (const game of games) {
      const platform = platformMapping.get(game.store)
      const product = createNewProduct()

      product._id = await FetchFreebiesRoutine.findAvailableGameId()
      product.responsible = LocalConst.PSEUDO_USER_SYSTEM_ID
      product.changed = Date.now()
      product.data.id = product._id
      product.data.urls.org = game.url
      product.status = 'processing'
      product.uuid = game.uuid

      const dbobj: ProductType = new Mongo.Product(product)
      if (!dbobj) return 'Bad gateway. Could not save product to mongo.'

      await dbobj.save()

      await AutoScraper.scrape(dbobj, game.url, false)
      dbobj.uuid = game.uuid

      if (platform.autoPublish) {
        dbobj.status = 'approved'
        await ProductApproval.completeProduct(dbobj, false)
      }

      await dbobj.save()
    }

    return true
  }

  //

  /** fetches a map with keys being the gibu name and the value being the platform */
  private static async fetchGibuPlatformMapping(): Promise<Map<string, SanitizedPlatformType>> {
    const list: PlatformDataType[] = await Mongo.Platform
      .find({})
      .lean(true)
      .exec()
      .catch(() => null)
    if (!list) return null

    const out = new Map()
    for (const plat of list)
      out.set(plat.gibuRef, PlatformSanitizer.sanitize(plat))

    return out
  }

  /** checks if a product with the provided uuid already exists */
  private static async isAlreadyKnown(uuid: string): Promise<boolean> {
    return await Mongo.Product.exists({ uuid })
  }

  /** returns a new number game id that is still available */
  private static async findAvailableGameId(): Promise<number> {
    let id = 0
    do {
      id = parseInt((Math.ceil(Date.now() / 10) + '').slice(-6))
      await Utils.sleep(200)
    } while (await Mongo.Product.exists({ _id: id }))
    return id
  }

}
