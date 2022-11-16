import { Request, Response } from 'express'
import GuildData from '../data/guild-data'
import { MAGICNUMBER_BAD_GATEWAY, MAGICNUMBER_MISSING_PERMISSIONS } from '../lib/magic-number'
import { Directives } from '../types/lib'


export async function getGuild(req: Request, res: Response) {
  const guild = req.params.guild
  if (!guild)
    return void res.status(400).end()

  const data = await GuildData.findGuild(guild, req.query as Directives)

  if (!data)
    return void res.status(404).end()

  if (data === MAGICNUMBER_BAD_GATEWAY)
    return void res.status(502).end()

  if (data === MAGICNUMBER_MISSING_PERMISSIONS)
    return void res.status(403).end()

  res.status(200).send(data)
}
