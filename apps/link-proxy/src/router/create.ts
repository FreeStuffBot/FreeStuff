import { Request, Response } from 'express'
import FirebasePagelink from '../lib/pagelink'


export async function postCreateGame(req: Request, res: Response) {
  const product = req.body
  if (!product || !product.urls?.org || !product.title || !product.description || !product.thumbnails?.org)
    return res.status(400).end()

  const link = await FirebasePagelink.createLinkForGame(product)
  res.status(200).json({ link })
}
