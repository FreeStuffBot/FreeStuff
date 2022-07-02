import { Request, Response, NextFunction } from "express"


export default function pagination(defaultPageSize = 20, maxPageSize = 50): (req: Request, res: Response, next: NextFunction) => any {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.pageOffset = req.query.offset
      ? parseInt(req.query.offset + '', 10)
      : 0
    if (res.locals.pageOffset < 0)
      res.locals.pageOffset = 0

    res.locals.pageAmount = req.query.amount
      ? parseInt(req.query.amount + '', 10)
      : defaultPageSize
    if (res.locals.pageAmount < 1)
      res.locals.pageAmount = 1
    if (res.locals.pageAmount > maxPageSize)
      res.locals.pageAmount = maxPageSize

    next()
  }
}
