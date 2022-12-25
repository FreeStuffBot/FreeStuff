import { Logger } from '@freestuffbot/common'
import axios from 'axios'
import { Request, Response } from 'express'
import DockerInterface, { FsContainer } from '../lib/docker-interface'


export async function postCommand(req: Request, res: Response) {
  const { receivers, name, data } = req.body ?? {}

  if (!receivers?.length || !name)
    return res.status(400).json({ error: 'bad request, invalid body' })

  const network = DockerInterface.getFsContainers()
  const targets = filterNetworkByReceivers(network, receivers)

  const payload = { name, data }
  const progress = targets.map(cont => deliverCommandToService(payload, cont))

  await Promise.all(progress)
  res.status(200).json({
    targets: targets.length
  })
}

function filterNetworkByReceivers(network: FsContainer[], receivers: string[]): FsContainer[] {
  if (receivers.includes('*')) return network

  const out: FsContainer[] = []
  for (const cont of network) {
    if (receivers.includes(cont.role) || receivers.includes(cont.id))
      out.push(cont)
  }
  return out
}

function deliverCommandToService(command: { name: string, data: any }, service: FsContainer): Promise<void> {
  if (!service.info?.features?.command || !service.info.commands.some(c => c.name === command.name))
    return

  return axios
    .post(
      `http://${service.networkIp}/umi/command`,
      command,
      { validateStatus: null, timeout: 10000 }
    )
    .catch((e) => void console.error(e))
}
