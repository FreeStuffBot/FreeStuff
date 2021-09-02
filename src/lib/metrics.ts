import { collectDefaultMetrics, Counter, Gauge, Registry } from 'prom-client'
import { Request, Response } from 'express'

/**
 * The Prometheus register used for the bot's metrics.
 */
export const register = new Registry()

/**
 * Express.js middleware for exporting the Prometheus metrics.
 */
export async function middleware(_req: Request, res: Response) {
  res.status(200).header({ 'Content-Type': 'text/plain' })
    .send(await register.metrics())
}

// Collect the default Node.js metrics (memory usage, garbage collection info, etc...)
collectDefaultMetrics({ register })

// dummy counter, replace please
export const requestsCounter = new Counter({
  name: 'thumbnailer_total_requests',
  help: 'Keeps track of the total amount of incoming requests',
  labelNames: [ 'gameid', 'tracker' ],
  registers: [ register ]
})

// dummy gauge, replace please
export const cachedImagesGauge = new Gauge({
  name: 'thumbnailed_cached_images',
  help: 'Shows the current amount of cached images',
  registers: [ register ]
})
cachedImagesGauge.reset()
