import { Logger } from '@freestuffbot/common'
import axios from 'axios'
import { Request, Response } from 'express'
import { config } from '../../..'
import ReqError from '../../../lib/req-error'


export async function getServices(_req: Request, res: Response) {
  const { status, data } = await axios
    .get(`/services/composed`, { baseURL: config.network.manager })
    .catch(() => ({ status: 999, data: null }))

  if (status < 200 || status >= 300)
    return ReqError.badGateway(res)

  res.status(200).json(data)
}

export async function postServicesCommand(req: Request, res: Response) {
  const { receivers, name, data } = req.body || {}

  if (!receivers?.length || !name)
    return ReqError.badRequest(res, 'Invalid Body', 'Missing receivers or name')

  try {
    if (data) {
      const d = JSON.stringify(data)
      if (d.length > 4096)
        return ReqError.badRequest(res, 'Invalid Payload', 'Command data exceeds 4096 characters. Aborting')
    }
  } catch (ex) {
    return ReqError.badRequest(res, 'Invalid Payload', 'Error serializing command data. Aborting')
  }

  const command = { receivers, name, data }

  const resp = await axios
    .post(
      `/services/command`,
      command,
      { baseURL: config.network.manager, validateStatus: null }
    )
    .catch(() => ({ status: 999, data: null }))

  Logger.debug("Resp: " + JSON.stringify({ d: resp.data, s: resp.status }))
  
  if (resp.status !== 200)
    return ReqError.badRequest(res, resp.status + '', resp.data?.error ?? '')

  res.status(200).json({})
}
