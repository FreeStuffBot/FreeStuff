import { createNewProduct, ProductApprovalStatusArray, ProductDataType, ProductType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from "../../../database/mongo"
import LocalConst from '../../../lib/localconst'
import ReqError from '../../../lib/reqerror'
import Utils from '../../../lib/utils'


export async function getProducts(req: Request, res: Response) {
  const statusFilter = req.query.status + ''

  if (statusFilter && !ProductApprovalStatusArray.includes(statusFilter))
    return ReqError.badRequest(res, 'Invalid Status', `Received "${statusFilter}". Must be in ${JSON.stringify(ProductApprovalStatusArray)}`)

  const query = statusFilter
    ? { status: statusFilter }
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

  if (!id || !/^\d{6,10}$/g.test(id))
    return ReqError.badRequest(res, 'Invalid Product Id', 'Product id did not match criteria.')

  const product: any = await Mongo.Product
    .findById(id)
    .lean(true)
    .exec()
    .catch(() => ReqError.badGateway(res)) as any[]

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

  const product: ProductDataType = createNewProduct()

  product._id = id
  product.responsible = LocalConst.PSEUDO_USER_SYSTEM_ID
  product.changed = Date.now()
  product.data.id

  if (fetching) {
    product.status = 'processing'
    product.uuid = `x:${id}`
  } else {
    product.status = 'pending'
    product.uuid = `custom:${id}`
  }

  const dbobj: ProductType = new Mongo.Product(product)
  if (!dbobj) return ReqError.badGateway(res)

  dbobj.save()
    .then(() => res.status(200).json({ id }))
    .catch((err) => ReqError.badGateway(res, err?.message))
}
