import { ProductDataType, ProductDiscountType, ProductDiscountTypeArray, ProductSanitizer } from '@freestuffbot/common'
import { Request, Response } from 'express'
import ReqError from '../../lib/req-error'
import Resolver from '../../lib/resolver'
import Utils from '../../lib/utils'


export function getChannels(_req: Request, res: Response) {
  res.status(200).json(ProductDiscountType)
}


export async function getChannel(req: Request, res: Response) {
  const name = req.params.channel

  if (!name || !ProductDiscountTypeArray.includes(name))
    return ReqError.notFound(res, `Channel '${name}' not found.`)
  
  const resolveItems = req.query.resolve && Utils.isStringTruthy(req.query.resolve + '')

  const products = await Resolver.resolveChannel(name)

  const out = { products } as any

  if (resolveItems) {  
    out.resolved = {}
    const resolving = out.products.map(async (id: number) => ([
      id, await Resolver.resolveProduct(id)
    ])) as [ number, ProductDataType ][]

    for (const [ id, data ] of await Promise.all(resolving)) {
      if (!data) continue
      out.resolved[id] = ProductSanitizer.sanitize(data)
    } 
  }

  res.status(200).send(out)
}
