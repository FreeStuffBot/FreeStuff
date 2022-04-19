import { AnnouncementType, createNewAnnouncement } from '@freestuffbot/common'
import RabbitHole, { TaskId } from '@freestuffbot/rabbit-hole'
import { Request, Response } from 'express'
import { config } from '../../..'
import Mongo from "../../../database/mongo"
import LocalConst from '../../../lib/localconst'
import ReqError from '../../../lib/reqerror'
import Utils from '../../../lib/utils'


export async function postAnnouncement(req: Request, res: Response) {
  let id = 0
  do {
    id = parseInt((Math.ceil(Date.now() / 10) + '').slice(-6))
    await Utils.sleep(200)
  } while (await Mongo.Announcement.exists({ _id: id }))

  const items = req.body?.products as number[]
  if (!items?.length) return ReqError.badRequest(res, 'Missing products', 'Products list empty or null')

  const allItemsValid = await Promise.all(items.map(_id => Mongo.Product.exists({ _id, status: 'approved' })))
  if (!allItemsValid) return ReqError.badRequest(res, 'Invalid products', 'One or more product provided does not exist.')

  const announcement = createNewAnnouncement()
  announcement._id = id
  announcement.responsible = LocalConst.PSEUDO_USER_SYSTEM_ID
  announcement.published = Date.now()
  announcement.status = 'published'
  announcement.items.push(...items)

  const dbobj: AnnouncementType = new Mongo.Announcement(announcement)
  if (!dbobj) return ReqError.badGateway(res)

  let guilds = await Mongo.Guild.count()
  if (guilds < 200000) guilds = 200000 // Failswitch, if the guilds yields 0, -1 or any other incorrect low value this wont create a single huge bucket
  const announcementBucketCount = Math.round(guilds / config.behavior.desiredGuildCountPerBucket)

  try {
    await dbobj.save()
  } catch (err) {
    return ReqError.badGateway(res, err?.message)
  }

  RabbitHole.publish({
    t: TaskId.DISCORD_PUBLISH_SPLIT,
    a: id,
    v: 0,
    c: announcementBucketCount
  })

  res.status(200).json({ id })
}
