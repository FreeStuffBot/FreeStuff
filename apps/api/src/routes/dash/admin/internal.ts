import { Logger, TranslationEntryType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
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
    // case 'republish_221013': {
    //   RabbitHole.publish({
    //     t: TaskId.DISCORD_PUBLISH_SPLIT,
    //     a: 339382,
    //     v: 450,
    //     c: 1207
    //   })
    //   return
    // }
    // case 'republish_220728': {
    //   RabbitHole.publish({
    //     t: TaskId.DISCORD_PUBLISH_SPLIT,
    //     a: 147076,
    //     v: 0,
    //     c: 1095
    //   })
    //   return
    // }
    // case 'migration221115': {
    //   migration221115_translations()
    //   return
    // }
  }
}

export async function migration221115_translations() {
  const IDS = await Mongo.Language
    .find({})
    .select({ _id: 1 })
    .exec()
    .then(l => l.map(p => p._id))
  const USER = '0' // system user

  for (const id of IDS) {
    const lang = await Mongo.Language
      .findById(id)
      .lean(true)
      .exec()
      .catch(Logger.error) as Record<string, string>

    for (const key in lang) {
      if (key.startsWith('_')) continue

      new Mongo.Translation({
        _id: `${id}:${key}:${USER}`,
        parent: `${id}:${key}`,
        type: TranslationEntryType.SUGGESTION,
        text: lang[key],
        createdAt: Date.now(),
        upvotedBy: [ USER ],
        downvotedBy: [ ]
      }).save()
    }
  }

  Logger.info('Done')
}
