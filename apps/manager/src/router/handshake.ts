import { Request, Response } from 'express'
import { Service, Services } from '../lib/services'
import * as ip from 'ip'
import { config } from '..'
import { Logger } from '@freestuffbot/common'


type ExpectedBodyForm = {
  /** container's hostname, aka the container id */
  host: string
  /** service kind, e.g. discord-interactions, api, thumbnailer, ... */
  role: string
  /** service's own ip addresses */
  ips: string[]
  /** some generic token the service provided, which is sent back on handshake return */
  loginToken: string
}

export async function postHandshake(req: Request, res: Response) {
  const body: ExpectedBodyForm = req.body

  console.log('REQUEST')
  console.log(req)
  console.log(JSON.stringify(req))
  console.log('REQUEST END')

  if (!body) return res.status(400).send('missing body')
  if (!body.host) return res.status(400).send('missing host')
  if (!body.role) return res.status(400).send('missing role')
  if (!body.loginToken) return res.status(400).send('missing loginToken')

  const srcAddr = req.ip?.startsWith('::ffff:')
    ? req.ip.substring('::ffff:'.length)
    : req.ip

  console.log('srcAddr: ' + srcAddr)
  console.log('bodyips: ' + body.ips)

  const addr = body.ips
    ? findClosestIpMatch(srcAddr, body.ips)
    : srcAddr

  console.log('-> addr: ' + addr)

  const subnet = config.network.umiAllowedIpRange
    ? ip.cidrSubnet(config.network.umiAllowedIpRange)
    : null
  if (subnet && !subnet.contains((addr))) res.status(403).end()

  Logger.debug(`Add service (id ${body.host}) (addr ${addr}) (role ${body.role})`)

  const service: Service = {
    id: body.host,
    addr,
    role: body.role
  }

  const response = await Services.returnHandshake(service, body.loginToken)
  if (!response) {
    Logger.info(`Service (id ${body.host}) (addr ${addr}) (role ${body.role}) sent handshake but could not be returned`)
    res.status(408).end()
    return
  }

  Logger.info(`Service (id ${body.host}) (addr ${addr}) (role ${body.role}) completed handshake`)
  Services.addService(service)

  res.status(200).end()
}

function rankIpMatch(bytes: string[], target: string[]): number {
  let out = 0
  for (let i = 0; i < bytes.length; i++)
    if (bytes[i] === target[i]) out++
  return out
}

function findClosestIpMatch(target: string, options: string[]): string {
  let mVal = 0
  let mItm = options[0]
  const bytes = target.split('.')
  for (const option of options) {
    const rank = rankIpMatch(bytes, option.split('.'))
    if (rank <= mVal) continue
    mVal = rank
    mItm = option
  }
  return mItm
}
