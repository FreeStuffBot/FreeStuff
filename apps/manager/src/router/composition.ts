import { Request, Response } from 'express'
import { desiredComposition } from '../data/network-composition'


export async function getComposition(req: Request, res: Response) {
  res.status(200).json(desiredComposition)
}
