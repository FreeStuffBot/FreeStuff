import { Request, Response } from 'express'
import ChannelsData from '../data/channels-data'
import { MAGICNUMBER_BAD_GATEWAY, MAGICNUMBER_MISSING_PERMISSIONS } from '../lib/magic-number'
import { Directives } from '../types/lib'


export async function getChannels(req: Request, res: Response) {
  const guild = req.params.guild
  if (!guild)
    return void res.status(400).end()

  const channels = await ChannelsData.findChannels(guild, req.query as Directives)

  if (!channels)
    return void res.status(404).end()

  if (channels === MAGICNUMBER_BAD_GATEWAY)
    return void res.status(502).end()

  if (channels === MAGICNUMBER_MISSING_PERMISSIONS)
    return void res.status(403).end()

  res.status(200).send(channels)
}
