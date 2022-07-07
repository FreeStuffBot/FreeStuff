/**
 * @author Andreas May <andreas@maanex.me>
 * @copyright 2020 File Authors
 */

import { Response } from 'express'


export default class ReqError {

  public static badRequest(res: Response, error: string, message: string): Response<any> {
    return res.status(400).json({ success: false, error, message })
  }

  public static missingBodyParam(res: Response, name: string): Response<any> {
    return res.status(400).json({ success: false, error: 'Invalid Body', message: `Missing Body Parameter "${name}"` })
  }

  public static invalidAuth(res: Response, message?: string): Response<any> {
    return res.status(401).json({ success: false, error: 'Unauthorized', message: message || 'Authorization header missing or invalid.' })
  }

  public static noAccess(res: Response, message?: string): Response<any> {
    return res.status(403).json({ success: false, error: 'Forbidden', message: message || 'Missing privileges to use the requested resource.' })
  }

  public static notFound(res: Response, message?: string): Response<any> {
    return res.status(404).json({ success: false, error: 'Not Found', message: message || 'The requested resource cannot be found.' })
  }

  public static endpointNotFound(res: Response): Response<any> {
    return res.status(404).json({ success: false, error: 'Endpoint Not Found', message: 'Endpoint Not Found. Please check the documentation: https://docs.freestuffbot.xyz/endpoints' })
  }

  public static rateLimited(res: Response): Response<any> {
    return res.status(429).json({ success: false, error: 'Too Many Requests', message: 'You are rate limited, please try later.' })
  }

  public static internalServerError(res: Response, message?: string): Response<any> {
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: message || 'An error occured, the website Administrator has been informed.' })
  }

  public static notImplemented(res: Response): Response<any> {
    return res.status(501).json({ success: false, error: 'Not Implemented', message: 'This option is not currently availabe' })
  }

  public static badGateway(res: Response, message?: string): Response<any> {
    return res.status(502).json({ success: false, error: 'Bad Gateway', message: message || 'Connection to an internal service (like a database) failed. Try again in a moment.' })
  }

  public static other(res: Response, status: number, error?: string, message?: string): Response<any> {
    return res.status(status).json({ success: false, error: error || 'An error occured', message: message || 'An error occured, please try again' })
  }

}

