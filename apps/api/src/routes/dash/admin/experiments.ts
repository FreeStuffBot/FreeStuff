import { ExperimentDataType, ExperimentSanitizer, ExperimentType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import AuditLog from '../../../lib/audit-log'
import ReqError from '../../../lib/req-error'


export async function getExperiments(_req: Request, res: Response) {
  const experiments: ExperimentDataType[] = await Mongo.Experiment
    .find({})
    .lean(true)
    .exec()
    .catch(() => {}) as any[]

  if (!experiments)
    return ReqError.badGateway(res)

  const out = experiments
    .map(ExperimentSanitizer.sanitize)

  res.status(200).json(out || {})
}


export function postExperiment(req: Request, res: Response) {
  const exp = req.body as ExperimentDataType & { id: string }
  if (!exp || !exp.id || !exp.description || !exp.rules)
    return ReqError.badRequest(res, 'Malformed request body', 'Missing one or more required fields.')

  const document = new Mongo.Experiment({
    _id: exp.id,
    description: exp.description,
    rules: exp.rules
  }) as ExperimentType

  document.save()
  res.status(200).json({})

  AuditLog.record({
    event: 'admin_experiment_create',
    author: res.locals.user?.id,
    id: exp.id,
    description: exp.description,
    rules: exp.rules
  })
}


export async function patchExperiment(req: Request, res: Response) {
  if (!req.params.experiment)
    return ReqError.badRequest(res, 'Malformed request', 'Missing id.')

  const document: ExperimentType = await Mongo.Experiment
    .findById(req.params.experiment)
    .exec()
    .catch(() => {}) as any

  if (!document)
    return ReqError.badRequest(res, 'Experiment not found', 'Invalid id.')

  if (req.body?.description)
    document.description = req.body?.description + ''
  if (req.body?.rules)
    document.rules = req.body?.rules + ''

  document.save()
  res.status(200).json({})

  AuditLog.record({
    event: 'admin_experiment_update',
    author: res.locals.user?.id,
    id: req.params.experiment,
    description: req.body.description,
    rules: req.body.rules
  })
}


export async function deleteExperiment(req: Request, res: Response) {
  if (!req.params.experiment)
    return ReqError.badRequest(res, 'Malformed request', 'Missing id.')

  const document: ExperimentType = await Mongo.Experiment
    .findById(req.params.experiment)
    .exec()
    .catch(() => {}) as any

  if (!document)
    return ReqError.badRequest(res, 'Experiment not found', 'Invalid id.')

  document.delete()
  res.status(200).json({})

  AuditLog.record({
    event: 'admin_experiment_delete',
    author: res.locals.user?.id,
    id: req.params.experiment
  })
}
