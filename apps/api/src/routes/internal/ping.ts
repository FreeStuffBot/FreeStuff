import { Request, Response } from 'express'


export async function allPing(req: Request, res: Response) {
  res.status(200).send('pong')
}
