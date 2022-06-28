import { Request, Response } from 'express'
import { applyComposition } from '../lib/apply-composition'
import DockerInterface from '../lib/docker-interface'


export async function getServicesRaw(req: Request, res: Response) {
  const data = await DockerInterface.getFsContainers()
  res.status(200).json(data)
}

export async function getServicesComposed(req: Request, res: Response) {
  const data = await DockerInterface.getFsContainers()
  const out = await applyComposition(data)
  res.status(200).json(out)
}
