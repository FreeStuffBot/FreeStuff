// For new contributors, give the Prometheus metric types a read https://prometheus.io/docs/concepts/metric_types/
// Also using prom-client for exposing the metrics https://github.com/siimon/prom-client

import { collectDefaultMetrics, Counter, Registry } from 'prom-client'
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

/**
 * Discord received messages counter.
 *
 * Labels:
 * - `author_type`: 'user' or 'bot'.
 */
export const receivedMessagesCounter = new Counter({
  name: 'discord_received_messages',
  help: 'Keeps track of the total number of messages received',
  labelNames: [ 'author_type' ] as const,
  registers: [ register ]
})


/**
 * Discord received legacy commands counter.
 *
 * Labels:
 * - `state`: `success`, `failed`, `errored`, `cant_send_messages`, `guild_data_fetch_failed`
 */
export const legacyCommandsCounter = new Counter({
  name: 'discord_legacy_commands',
  help: 'Keeps track of the total number of legacy commands received',
  labelNames: [ 'state' ] as const,
  registers: [ register ]
})
