import { Response, Router } from 'express'
import ReqError from '../../lib/reqerror'
import { apiGateway } from '../../middleware/api-gateway'
import { allPing } from './ping'


export const internalRouter: Router = Router()

internalRouter.all('*', apiGateway('internal'))

internalRouter.all('/ping', allPing)

internalRouter.all('*', (_, res: Response) => ReqError.endpointNotFound(res))
