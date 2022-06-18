import { Request, Response } from 'express'
import { applyComposition } from '../lib/apply-composition'


export async function getServicesRaw(req: Request, res: Response) {
  // const data = await DockerInterface.getFsContainers()
  const data = []
  res.status(200).json(data)
}

export async function getServicesComposed(req: Request, res: Response) {
  // const data = await DockerInterface.getFsContainers()
  const data = []
  const out = applyComposition(data)
  res.status(200).json(out)
}
