import { Request, Response } from 'express'
import { config } from '..'
import Metrics from '../lib/metrics'


export function getMetrics(_req: Request, res: Response) {
  const out = Metrics.renderPrometheus(config.metrics.recordName)
  res.status(200).send(out)
}
