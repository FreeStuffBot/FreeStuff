import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import ReqError from '../../../lib/req-error'


export async function postLine(req: Request, res: Response) {
  if (!req.body?.key)
    return ReqError.badRequest(res, 'missing_key', 'No key provided')

  const key = req.body.key
  // .exists does not work because you can't put it in { strict: false } mode
  const exists = await Mongo.Language.findOne(
    { _index: 0, [key]: { $ne: null } },
    { _id: 1 },
    { strict: false }
  )
  if (exists)
    return ReqError.badRequest(res, 'duplicate_key', 'Provided key already exists')

  const eng = req.body.english ?? ''
  const desc = req.body.description

  await Mongo.Language.updateOne(
    { _index: 0 },
    { $set: { [key]: eng } },
    { strict: false, returnNewDocument: false }
  ).exec()

  if (desc) {
    Mongo.Language.updateOne(
      { _id: 'descriptions' },
      { $set: { [key]: desc } },
      { strict: false, returnNewDocument: false }
    ).exec()
  }

  res.status(200).end()
}

