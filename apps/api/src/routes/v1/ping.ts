import { Request, Response } from 'express'


export function ping(_req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    data: { }
  })
}
