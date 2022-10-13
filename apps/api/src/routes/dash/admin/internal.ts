import { Logger } from '@freestuffbot/common'
import { TaskId } from '@freestuffbot/rabbit-hole'
import RabbitHole from '@freestuffbot/rabbit-hole/dist/rabbit-hole'
import { Request, Response } from 'express'
import ReqError from '../../../lib/req-error'


export function postInternalCommand(req: Request, res: Response) {
  const { command } = req.body ?? {}
  if (!command) return ReqError.badRequest(res, 'missing command', 'invalid body')

  Logger.info(`Running internal command ${command}`)
  runCommand(command)
  res.status(200).send({})
}

function runCommand(command: string) {
  switch (command.toLowerCase()) {
    case 'debug': {
      Logger.debug('Debug')
      return
    }
    case 'republish_221013': {
      RabbitHole.publish({
        t: TaskId.DISCORD_PUBLISH_SPLIT,
        a: 339382,
        v: 424,
        c: 1207
      })
      return
    }
    // case 'republish_220728': {
    //   RabbitHole.publish({
    //     t: TaskId.DISCORD_PUBLISH_SPLIT,
    //     a: 147076,
    //     v: 0,
    //     c: 1095
    //   })
    //   return
    // }
  }
}
