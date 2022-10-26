import { Logger, TranslationEntryType } from "@freestuffbot/common"
import Mongo from "../mongo"


export async function migration221026_translations() {
  const IDS = [ 'de-DE' ]
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
