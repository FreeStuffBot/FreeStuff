import { Request, Response } from 'express'
import MemberData from '../data/member-data'
import { MAGICNUMBER_BAD_GATEWAY, MAGICNUMBER_MISSING_PERMISSIONS } from '../lib/magic-number'
import { Directives } from '../types/lib'


export async function getMember(req: Request, res: Response) {
  const guild = req.params.guild
  if (!guild)
    return void res.status(400).end()

  const member = await MemberData.findMember(guild, req.query as Directives)

  if (!member)
    return void res.status(404).end()

  if (member === MAGICNUMBER_BAD_GATEWAY)
    return void res.status(502).end()

  if (member === MAGICNUMBER_MISSING_PERMISSIONS)
    return void res.status(403).end()

  res.status(200).send(member)
}
