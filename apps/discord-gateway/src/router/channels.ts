import { Request, Response } from 'express'
import ChannelsAPI from '../api/channels-api'
import ChannelsCache from '../cache/channels-cache'
import { DataChannel } from '../types/data'


const MAGICNUMBER_BAD_GATEWAY = 0xFF00_01
type MagicNumber = typeof MAGICNUMBER_BAD_GATEWAY

export async function getChannels(req: Request, res: Response) {
  const guild = req.params.guild
  if (!guild)
    return void res.status(400)

  const channels = await findChannels(guild, Object.keys(req.query))

  if (!channels)
    return void res.status(404).end()

  if (channels === MAGICNUMBER_BAD_GATEWAY)
    return void res.status(502).end()

  res.status(200).send(channels)
}

async function findChannels(guild: string, directives: string[]): Promise<DataChannel[] | MagicNumber | null> {
  if (!directives.includes('nocache')) {
    const cache = ChannelsCache.get(guild)
    if (cache !== undefined) return cache
  }
  console.log('skip cache')
  const fresh = await ChannelsAPI.fetchChannels(guild)
  if (fresh === undefined) return MAGICNUMBER_BAD_GATEWAY
  ChannelsCache.set(guild, fresh)
  return fresh
}
