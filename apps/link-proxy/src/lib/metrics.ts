import { Request, Response } from 'express'
import ms from 'ms'
import { config } from '..'
import Mongo from "../database/mongo"
import FirebasePagelink, { FirebaseLinkAnalytics } from "./pagelink"


export type ActiveProduct = {
  id: number
  url: string
  age: number
  data?: FirebaseLinkAnalytics
}

export default class Metrics {

  private static readonly MAX_AGE = 29 * 24 * 60 * 60 * 1000 // 29 days

  private static productCache: Set<ActiveProduct> = new Set()

  public static init() {
    Metrics.refreshProducts()

    // every hour
    setInterval(() => {
      Metrics.refreshProducts()
    }, ms(config.metrics.scrapeInterval))
  }

  private static async refreshProducts() {
    const newCache: typeof Metrics.productCache = new Set()
    const prods = await Metrics.getActiveProducts()
    // TODO(low) LINK PROXY SERVICE ADD DELAY BETWEEN GOOGLE ANALYTICS REQUESTS (POTENTIAL 5/s RATELIMIT)
    const betterProds = await Promise.all(prods.map(Metrics.fetchAndApplyAnalytics))
    betterProds
      .filter(prod => prod?.data)
      .forEach(prod => newCache.add(prod))
    Metrics.productCache = newCache
  }

  //

  private static async fetchAndApplyAnalytics(product: ActiveProduct): Promise<ActiveProduct> {
    const analytics = await FirebasePagelink.getAnalyticsFor(product.url)
    if (typeof analytics === 'number') return
    product.data = analytics
    return product
  }

  private static async getActiveProducts(): Promise<ActiveProduct[]> {
    const today = Date.now()
    const oldestAllowedDate = today - this.MAX_AGE

    const list = await Mongo.Product
      .find({
        published: { $gt: oldestAllowedDate },
        status: 'published'
      })
      .select({
        _id: 1,
        changed: 1,
        'data.urls.default': 1
      })
      .exec()
      .catch(() => {})

    if (!list) return null

    return list
      .filter(p => !!p)
      .map(product => ({
        id: product._id,
        url: product.data?.urls?.default,
        age: today - product.changed
      }))
      .filter(product => product.url)
  }

  //

  public static renderPrometheus(name: string): string {
    const entries = [ ...Metrics.productCache.values() ]
      .flatMap(m => Object
        .keys(m.data)
        .map(type => `${name}{id="${m.id}",type="${type}"} ${m.data[type]}`)
      )
    return [
      `# HELP ${name} Product visit analytics`,
      `# TYPE ${name} counter`,
      ...entries
    ].join('\n')
  }

  //

  public static endpoint() {
    return function (_req: Request, res: Response) {
      const out = Metrics.renderPrometheus(config.metrics.recordName)
      res
        .status(200)
        .header({ 'Content-Type': 'text/plain' })
        .send(out)
    }
  }

}
