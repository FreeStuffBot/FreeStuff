import { createNewProduct, ProductDataType, ProductType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from "../../../database/mongo"
import AuditLog from '../../../lib/audit-log'
import AutoScraper from '../../../lib/auto-scraper'
import InputValidator from '../../../lib/input-validator'
import LocalConst from '../../../lib/local-const'
import ProductApproval from '../../../lib/product-approval'
import ReqError from '../../../lib/req-error'
import Utils from '../../../lib/utils'


export async function getProducts(req: Request, res: Response) {
  const queryName = req.query.queryName + ''

  const query
    = (queryName === 'pending') ? { status: { $in: [ 'pending', 'approved', 'processing' ] } }
    : (queryName === 'published') ? { status: { $in: [ 'published', 'declined' ] } }
    : {}

  const products = await Mongo.Product
    .find(query)
    .skip(res.locals.pageOffset)
    .limit(res.locals.pageAmount)
    .lean(true)
    .select({
      _id: 1,
      uuid: 1,
      status: 1,
      responsible: 1,
      changed: 1,
      'data.title': 1,
      'data.thumbnails': 1,
      'data.staffApproved': 1
    })
    .exec()
    .catch(() => ReqError.badGateway(res)) as any[]

  for (const product of products) {
    product.id = product._id
    delete product._id
  }

  res.status(200).json(products || {})
}


export async function getProduct(req: Request, res: Response) {
  const id = req.params.product + ''

  let error: string
  if (error = InputValidator.validateProductId(id))
    return ReqError.badRequest(res, 'Invalid Product Id', error)

  const product = await Mongo.Product
    .findById(id)
    .lean(true)
    .exec()
    .catch(() => {})

  if (!product)
    return ReqError.notFound(res, 'Product not found')

  product.id = product._id
  delete product._id

  res.status(200).json(product || {})
}


export async function postProduct(req: Request, res: Response) {
  const url = (req.body?.url ?? '') + ''
  const fetching = !!url && url.startsWith('http')

  let id = 0
  do {
    id = parseInt((Math.ceil(Date.now() / 10) + '').slice(-6))
    await Utils.sleep(200)
  } while (await Mongo.Product.exists({ _id: id }))

  const product = createNewProduct()

  product._id = id
  product.responsible = res.locals.user?.id ?? LocalConst.PSEUDO_USER_UNKNOWN_ID
  product.changed = Date.now()
  product.data.id = id
  product.data.urls.org = url

  if (fetching) {
    product.status = 'processing'
    product.uuid = `x:${id}`
  } else {
    product.status = 'pending'
    product.uuid = `custom:${id}`
  }

  const dbobj: ProductType = new Mongo.Product(product)
  if (!dbobj) return ReqError.badGateway(res)

  try {
    await dbobj.save()
    res.status(200).json({ id })

    if (fetching)
      AutoScraper.scrape(dbobj, url, false)
  } catch (err) {
    ReqError.badGateway(res, err?.message)
  }
}


export async function patchProduct(req: Request, res: Response) {
  const id = req.params.product + ''
  
  let error: string
  if (error = InputValidator.validateProductId(id))
    return ReqError.badRequest(res, 'Invalid Product Id', error)

  const body: ProductDataType = req.body
  if (!body || typeof body !== 'object')
    return ReqError.badRequest(res, 'Invalid Body', 'Missing form body or invalid data format.')

  const product: ProductType = await Mongo.Product
    .findById(id)
    .catch(() => {})

  if (!product)
    return ReqError.notFound(res, 'Product not found')

  if (product.status === 'processing' || product.status === 'published')
    return ReqError.badRequest(res, 'Product is readonly', `This product's status is "${product.status}", which makes it immuteable. You cannot edit this.`)

  //

  if (body.status)
    product.status = body.status

  if (body.data)
    product.data = body.data

  if (body.status === 'approved')
    await ProductApproval.completeProduct(product, true)

  product.responsible = res.locals.user?.id ?? LocalConst.PSEUDO_USER_UNKNOWN_ID
  product.changed = Date.now()

  AuditLog.record({
    event: (body.status === 'approved')
      ? 'product_save_approve'
      : 'product_save_draft',
    author: product.responsible,
    product: product._id?.toString()
  })

  await product.save().catch(() => {})
  res.status(200).json({})
}


export async function postProductRefetch(req: Request, res: Response) {
  const id = req.params.product + ''
  
  let error: string
  if (error = InputValidator.validateProductId(id))
    return ReqError.badRequest(res, 'Invalid Product Id', error)

  const body: { url: string, merge: boolean } = req.body
  if (!body || typeof body !== 'object')
    return ReqError.badRequest(res, 'Invalid Body', 'Missing form body or invalid data format.')

  if (!body.url)
    return ReqError.badRequest(res, 'Invalid Body', 'Missing url.')

  if (body.merge === undefined)
    return ReqError.badRequest(res, 'Invalid Body', 'Missing merge.')

  const product: ProductType = await Mongo.Product
    .findById(id)
    .catch(() => {})

  if (!product)
    return ReqError.notFound(res, 'Product not found')

  if (product.status === 'processing' || product.status === 'published')
    return ReqError.badRequest(res, 'Product is readonly', `This product's status is "${product.status}", which makes it immuteable. You cannot edit this.`)

  //

  product.status = 'processing'
  product.responsible = res.locals.user?.id ?? LocalConst.PSEUDO_USER_UNKNOWN_ID
  product.changed = Date.now()

  AuditLog.record({
    event: 'product_refetch',
    author: product.responsible,
    product: product._id?.toString()
  })
  
  try {
    await product.save()
    res.status(200).json({})

    AutoScraper.scrape(product, body.url, body.merge)
  } catch (err) {
    ReqError.badGateway(res, err?.message)
  }
}
