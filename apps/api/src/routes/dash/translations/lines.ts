import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import ReqError from '../../../lib/req-error'


export async function postLine(req: Request, res: Response) {
  if (!req.body?.key)
    return ReqError.badRequest(res, 'missing_key', 'No key provided')

  const key = req.body.key
  const exists = await Mongo.Language.exists({
    _index: 0,
    [key]: { $exists: 1 }
  })
  if (exists)
    return ReqError.badRequest(res, 'duplicate_key', 'Provided key already exists')

  const eng = req.body.english ?? ''
  const desc = req.body.description

  await Mongo.Language.updateOne(
    { _index: 0 },
    { $set: { [key]: eng } },
    { strict: false, returnNewDocument: false }
  )

  return Mongo.Language
    .findById(name)
    .lean(true)
    .exec()
    .then(data => res.status(200).json(data || {}))
    .catch(() => ReqError.badGateway(res))
}

