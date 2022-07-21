import { Request, Response } from 'express'
import Mongo from '../../database/mongo'


export function postPublishingProgress(req: Request, res: Response) {
  const { service, bucket, event } = req.body ?? {}
  const announcementId = Number(req.params.announcement + '')
  const bucketId = Number(bucket)

  if (bucketId < 0 || isNaN(bucketId))
    return res.status(400).end()

  if (![ 'begin', 'complete' ].includes(event))
    return res.status(400).end()

  if (![ 'discord' ].includes(service))
    return res.status(400).end()

  const content = (event === 'complete')
    ? -bucketId
    : bucketId

  Mongo.Announcement.updateOne({
    _id: announcementId
  }, {
    $push: {
      [ `publishingMeta.${service}.bucketProgress` ]: content
    }
  }).exec()

  res.status(200).end()
}
