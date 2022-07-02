import { Request, Response } from 'express'


export function allPing(_req: Request, res: Response) {
  res.status(200).send('pong')
}
