import { Request, Response } from 'express'
import GuilddataData from '../data/guilddata-data'
import { MAGICNUMBER_BAD_GATEWAY } from '../lib/magic-number'


export async function getMember(req: Request, res: Response) {
  const guild = req.params.guild
  if (!guild)
    return void res.status(400)

  const channels = await GuilddataData.findGuilddata(guild, Object.keys(req.query))

  if (!channels)
    return void res.status(404).end()

  if (channels === MAGICNUMBER_BAD_GATEWAY)
    return void res.status(502).end()

  res.status(200).send(channels)
}
