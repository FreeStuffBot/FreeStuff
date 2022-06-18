import { Request, Response } from 'express'
import { Service, Services } from '../lib/services'
import * as ip from 'ip'
import { config } from '..'


type ExpectedBodyForm = {
  /** container's hostname, aka the container id */
  host: string
  /** service kind, e.g. discord-interactions, api, thumbnailer, ... */
  role: string
}

export async function postHandshake(req: Request, res: Response) {
  const body: ExpectedBodyForm = req.body

  if (!body) return res.status(400).send('missing body')
  if (!body.host) return res.status(400).send('missing host')
  if (!body.role) return res.status(400).send('missing role')

  const addr = req.ip
  console.log('HANDSHAKE DEBUG START')
  console.log(req.ip)
  console.log(req.ips)
  console.log('HANDSHAKE DEBUG END')

  const subnet = config.network.umiAllowedIpRange
    ? ip.cidrSubnet(config.network.umiAllowedIpRange)
    : null
  if (!subnet.contains((addr))) res.status(403).end()

  console.log('VALID')

  const service: Service = {
    id: body.host,
    addr,
    role: body.role
  }
  Services.addService(service)

  res.status(200).end()
}
