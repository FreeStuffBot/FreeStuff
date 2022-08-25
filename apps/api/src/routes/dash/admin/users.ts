import { SanitizedUserType, UserDataType, UserSanitizer, UserType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import ReqError from '../../../lib/req-error'


export async function getUsers(_req: Request, res: Response) {
  const users: UserDataType[] = await Mongo.User
    .find({})
    .lean(true)
    .exec()
    .catch(() => {}) as any[]

  if (!users)
    return ReqError.badGateway(res)

  const out = users
    .map(UserSanitizer.sanitize)

  res.status(200).json(out || [])
}


export function postUser(req: Request, res: Response) {
  const usr = req.body as Omit<SanitizedUserType, 'data'>
  if (!usr || !usr.id || !usr.name || !usr.scope)
    return ReqError.badRequest(res, 'Malformed request body', 'Missing one or more required fields.')

  const document = new Mongo.User({
    _id: usr.id,
    display: usr.name,
    scope: usr.scope
  }) as UserType

  document.save()
  res.status(200).json({})
}


export async function patchUser(req: Request, res: Response) {
  if (!req.params.user)
    return ReqError.badRequest(res, 'Malformed request', 'Missing id.')

  const document: UserType = await Mongo.User
    .findById(req.params.user)
    .exec()
    .catch(() => {}) as any

  if (!document)
    return ReqError.badRequest(res, 'User not found', 'Invalid id.')

  if (req.body?.display)
    document.display = req.body?.display + ''
  if (req.body?.scope)
    document.scope = req.body?.scope ?? []

  document.save()
  res.status(200).json({})
}


export async function deleteUser(req: Request, res: Response) {
  if (!req.params.user)
    return ReqError.badRequest(res, 'Malformed request', 'Missing id.')

  const document: UserType = await Mongo.User
    .findById(req.params.user)
    .exec()
    .catch(() => {}) as any

  if (!document)
    return ReqError.badRequest(res, 'User not found', 'Invalid id.')

  document.delete()
  res.status(200).json({})
}
