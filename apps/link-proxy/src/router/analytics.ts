import { Request, Response } from 'express'
import FirebasePagelink from '../lib/pagelink'


export async function getAnalytics(req: Request, res: Response) {
  // const url = 'https://redirect.freestuffbot.xyz/game/wiVf#Iratus-Lord-of-the-Dead'
  const data = await FirebasePagelink.getAnalyticsFor(req.query.url + '')
  res.status(200).json(data)
}
