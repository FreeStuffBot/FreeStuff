import { CurrencyDataType, CurrencySanitizer, CurrencyType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from "../../../database/mongo"
import ReqError from '../../../lib/req-error'


export async function getCurrencies(_, res: Response) {
  const currencies = await Mongo.Currency
    .find({})
    .skip(res.locals.pageOffset)
    .limit(res.locals.pageAmount)
    .lean(true)
    .exec()
    .catch(() => ReqError.badGateway(res)) as any[]

  const sanitized = currencies.map(CurrencySanitizer.sanitize)

  res.status(200).json(sanitized || {})
}


export async function postCurrency(req: Request, res: Response) {
  const body = req.body
  if (!body || typeof body !== 'object')
    return ReqError.badRequest(res, 'Body invalid', 'Invalid body')

  if (!body.id || !/^\d{1,2}$/.test(body.id))
    return ReqError.badRequest(res, 'Body invalid', 'Id must be a number')

  const idTaken = await Mongo.Currency.exists({ _id: body.id })
  if (idTaken) return ReqError.badRequest(res, 'Id already taken', 'Another currency by this id already exists.')

  const data: CurrencyDataType = {
    _id: body.id,
    code: '',
    name: '',
    symbol: ''
  }

  const currency: CurrencyType = new Mongo.Currency(data)
  await currency.save()
  
  const out = CurrencySanitizer.sanitize(data)
  res.status(200).json(out)
}


export async function patchCurrency(req: Request, res: Response) {
  const id = req.params.currency
  if (!id)
    return ReqError.badRequest(res, 'Id invalid', 'Invalid id')

  const body = req.body
  if (!body || typeof body !== 'object')
    return ReqError.badRequest(res, 'Body invalid', 'Invalid body')
    
  const currency: CurrencyType = await Mongo.Currency
    .findById(id)
    .exec()
    .catch(() => {})

  if (!currency)
    return ReqError.notFound(res, `No currency with id "${id}" found!`)

  for (const key in body) {
    if (key === 'id') continue
    currency[key] = body[key]
  }

  currency.save()
    .then(() => res.status(200).json({}))
    .catch(err => ReqError.badGateway(res, JSON.stringify(err)))
}


export async function deleteCurrency(req: Request, res: Response) {
  const id = req.params.currency
  if (!id)
    return ReqError.badRequest(res, 'Id invalid', 'Invalid id')
    
  const currency: CurrencyType = await Mongo.Currency
    .findById(id)
    .exec()
    .catch(() => {})

  if (!currency)
    return ReqError.notFound(res, `No currency with id "${id}" found!`)

  currency.delete()
    .then(() => res.status(200).json({}))
    .catch(err => ReqError.badGateway(res, JSON.stringify(err)))
}
