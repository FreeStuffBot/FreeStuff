import { AnnouncementDataType, AnnouncementSanitizer, ProductDataType, ProductSanitizer, SanitizedAnnouncementType, SanitizedProductType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import ReqError from '../../lib/req-error'
import Resolver from '../../lib/resolver'
import Utils from '../../lib/utils'


type OutType = Omit<SanitizedAnnouncementType, 'responsible'> & {
  resolved: Record<string, SanitizedProductType>
}

export async function getAnnouncement(req: Request, res: Response) {
  const id = req.params.announcement
  if (!id) return ReqError.badRequest(res, 'Invalid Announcement Id', 'Announcement Id not found.')
  if (!id.match(/^\d{1,10}$/)) return ReqError.badRequest(res, 'Invalid Announcement Id', 'Announcement Id must be a positive integer')

  const numId = parseInt(id, 10)
  if (!numId || isNaN(numId)) return ReqError.badRequest(res, 'Huh', 'Hmmmmmm')

  const resolveItems = req.query.resolve && Utils.isStringTruthy(req.query.resolve + '')

  const data: AnnouncementDataType = await Resolver.resolveAnnouncement(numId)
  if (!data) return ReqError.notFound(res, `No announcement by id ${id} found!`)

  const out: Partial<OutType> = AnnouncementSanitizer.sanitize(data)
  delete (out as any).responsible

  if (resolveItems) {
    out.resolved = {}
    const resolving = out.products.map(async id => (
      [ id, await Resolver.resolveProduct(id) ] as
      [ number, ProductDataType ]
    ))

    for (const [ id, data ] of await Promise.all(resolving)) {
      if (!data) continue
      out.resolved[id] = ProductSanitizer.sanitize(data)
    }
  }

  res.status(200).json(out)
}
