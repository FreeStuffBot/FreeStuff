import { ProductDataType } from '@freestuffbot/common'
import { Router, Request, Response } from 'express'
import Mongo from '../../database/mongo'


const UPDATE_INTERVAL = 1000 * 60 // 1 min

export const router: Router = Router()

const categories = {
  all: () => ({}),
  approved: () => ({ status: 'published' }),
  free: () => ({ status: 'published', 'data.type': 'keep', 'data.until': { $gt: Date.now() } })
} as { [category: string]: () => any }

//

router.get('/:category', (req: Request, res: Response) => {
  const cat = req.params.category.toLowerCase()
  if (!cat || !categories[cat]) return res.status(404).json({ success: false, error: 'Not found', message: 'Invalid category. Check docks.' })

  fetch(categories[cat](), cat).then(data => res
    .status(cache[cat].current === null ? 502 : 200)
    .header({ 'X-Meta-LastUpdate': cache[cat].lastUpdate })
    .json({ success: true, data }))
})

const cache = <{[cacheid: string]: { current: number[] | null, lastUpdate: number }}> { }

function fetch(filter: any, cacheid: string, force = false): Promise<number[]> {
  if (!cache[cacheid]) cache[cacheid] = { current: null, lastUpdate: 0 }
  const cc = cache[cacheid]

  if (!force && Date.now() - cc.lastUpdate < UPDATE_INTERVAL)
    return Promise.resolve(cc.current || [])

  cc.lastUpdate = Date.now()
  return new Promise((res) => {
    // eslint-disable-next-line no-unused-expressions
    Mongo.Product
      .find(filter)
      .sort({ published: -1 })
      .select({ _id: 1 })
      .lean(true)
      .exec()
      .then((products: ProductDataType[]) => {
        const id = products.map(p => p._id)
        cc.current = id
        res(id || [])
      })
      .catch(() => {
        cc.current = null
      })
      .finally(() => res(cc.current || []))
  })
}
