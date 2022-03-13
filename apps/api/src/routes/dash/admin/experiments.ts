import { ExperimentDataType, ExperimentSanitizer } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import ReqError from '../../../lib/reqerror'


export async function getExperiments(req: Request, res: Response) {
  const experiments: ExperimentDataType[] = await Mongo.Experiment
    .find({})
    .lean(true)
    .exec()
    .catch(() => ReqError.badGateway(res)) as any[]

  const out = experiments
    .map(ExperimentSanitizer.sanitize)

  res.status(200).json(out || {})
}