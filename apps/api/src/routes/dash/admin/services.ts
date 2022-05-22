import axios from 'axios'
import { Request, Response } from 'express'
import { config } from '../../..'
import ReqError from '../../../lib/req-error'


export async function getServices(req: Request, res: Response) {
  const { status, data } = await axios
    .get(`/services/composed`, { baseURL: config.network.manager })
    .catch(() => ({ status: 999, data: null }))

  if (status < 200 || status >= 300)
    return ReqError.badGateway(res)

  res.status(200).json(data)
}
