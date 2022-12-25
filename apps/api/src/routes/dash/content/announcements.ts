import { AnnouncementType, createNewAnnouncement, Logger, ProductType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from "../../../database/mongo"
import LocalConst from '../../../lib/local-const'
import ReqError from '../../../lib/req-error'
import Upstream from '../../../lib/upstream'
import Utils from '../../../lib/utils'


export async function postAnnouncement(req: Request, res: Response) {
  let id = 0
  do {
    id = parseInt((Math.ceil(Date.now() / 10) + '').slice(-6))
    await Utils.sleep(200)
  } while (await Mongo.Announcement.exists({ _id: id }))

  const items = req.body?.products as number[]
  if (!items?.length) return ReqError.badRequest(res, 'Missing products', 'Products list empty or null')

  const itemsValid = await Promise.all(items.map(_id => Mongo.Product.findOne({ _id, status: 'approved' }).exec() as Promise<ProductType>))
  if (!itemsValid.every(i => !!i)) return ReqError.badRequest(res, 'Invalid products', 'One or more products provided do not exist or are not approved.')

  try {
    for (const product of itemsValid) {
      product.status = 'published'
      // product.responsible = res.locals.user?.id ?? LocalConst.PSEUDO_USER_UNKNOWN_ID
      // product.changed = Date.now()
      await product.save()
    }
  } catch (err) {
    Logger.error(err)
    return
  }

  const announcement = createNewAnnouncement()
  announcement._id = id
  announcement.responsible = res.locals.user?.id ?? LocalConst.PSEUDO_USER_UNKNOWN_ID
  announcement.published = Date.now()
  announcement.status = 'published'
  announcement.products.push(...items)

  const dbobj: AnnouncementType = new Mongo.Announcement(announcement)
  if (!dbobj) return ReqError.badGateway(res)

  try {
    await dbobj.save()
  } catch (err) {
    return ReqError.badGateway(res, err?.message)
  }

  Upstream.publish(dbobj)

  res.status(200).json({ id })
}
