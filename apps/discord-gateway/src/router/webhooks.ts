import { Request, Response } from 'express'
import WebhooksApi from '../api/webhooks-api'
import WebhooksData from '../data/webhooks-data'
import { MAGICNUMBER_BAD_GATEWAY, MAGICNUMBER_MAX_WEBHOOKS_REACHED, MAGICNUMBER_MISSING_PERMISSIONS } from '../lib/magic-number'
import { Directives } from '../types/lib'


export async function getWebhooks(req: Request, res: Response) {
  const channel = req.params.channel
  if (!channel)
    return void res.status(400).end()

  const webhooks = await WebhooksData.findWebhooks(channel, req.query as Directives)

  if (!webhooks) // no webhooks would be [], this is about other issues
    return void res.status(500).end()

  if (webhooks === MAGICNUMBER_BAD_GATEWAY)
    return void res.status(502).end()

  if (webhooks === MAGICNUMBER_MISSING_PERMISSIONS)
    return void res.status(403).end()

  res.status(200).send(webhooks)
}

export async function getWebhook(req: Request, res: Response) {
  const hookid = req.params.hookid
  const hooktoken = req.params.hooktoken
  if (!hookid || !hooktoken)
    return void res.status(400).end()

  const accessor = `${hookid}/${hooktoken}`

  const webhook = await WebhooksApi.fetchWebhook(accessor, req.query as Directives)

  if (webhook === null)
    return void res.status(404).end()

  if (!webhook)
    return void res.status(500).end()

  if (webhook === MAGICNUMBER_BAD_GATEWAY)
    return void res.status(502).end()

  if (webhook === MAGICNUMBER_MISSING_PERMISSIONS)
    return void res.status(403).end()

  res.status(200).send(webhook)
}

export async function postWebhook(req: Request, res: Response) {
  const channel = req.params.channel
  if (!channel)
    return void res.status(400).end()

  const webhook = await WebhooksApi.createWebhook(channel)

  if (!webhook)
    return void res.status(500).end()

  if (webhook === MAGICNUMBER_BAD_GATEWAY)
    return void res.status(502).end()

  if (webhook === MAGICNUMBER_MISSING_PERMISSIONS)
    return void res.status(403).end()

  if (webhook === MAGICNUMBER_MAX_WEBHOOKS_REACHED)
    return void res.status(409).end()

  res.status(200).send(webhook)
}
