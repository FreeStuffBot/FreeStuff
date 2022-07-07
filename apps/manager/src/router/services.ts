import { Request, Response } from 'express'
import { applyComposition } from '../lib/apply-composition'
import DockerInterface from '../lib/docker-interface'


export function getServicesRaw(_req: Request, res: Response) {
  const data = DockerInterface.getFsContainers()
  res.status(200).json(data)
}

export async function getServicesComposed(_req: Request, res: Response) {
  const data = DockerInterface.getFsContainers()
  const out = await applyComposition(data)
  res.status(200).json(out)
}
