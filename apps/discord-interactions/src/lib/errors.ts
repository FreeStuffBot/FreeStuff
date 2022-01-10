import { FragileError } from "@freestuffbot/common"
import { InteractionApplicationCommandCallbackData, ReplyableCommandInteraction, ReplyableComponentInteraction } from "cordo"


export default class Errors {

  public static readonly STATUS_NOT_INITIALIZED = 10_000
  public static readonly STATUS_NO_GUILDDATA = 10_001

  //

  public static handleError(error: FragileError, i?: ReplyableCommandInteraction | ReplyableComponentInteraction): InteractionApplicationCommandCallbackData {
    const data: InteractionApplicationCommandCallbackData = {
      title: 'An error occured',
      description: `\`${error.status} ${error.name} @${error.source}\``
        + (error.description ? `\n${error.description}` : '')
        + (error.fix ? `\n${error.fix}` : '')
    }

    // TODO Metrics.log.blabla

    i?.replyPrivately(data)
    return data
  }

  //

  public static createStderrNotInitialized(): FragileError {
    return {
      status: Errors.STATUS_NOT_INITIALIZED,
      name: 'not initialized',
      source: 'stderr',
      description: 'The data has not been loaded yet.',
      fix: 'Please try again in a few seconds.'
    }
  }

  public static createStderrNoGuilddata(): FragileError {
    return {
      status: Errors.STATUS_NO_GUILDDATA,
      name: 'no guilddata',
      source: 'stderr',
      description: 'The data for your guild could not be loaded.',
      fix: 'Please try again.'
    }
  }

}
