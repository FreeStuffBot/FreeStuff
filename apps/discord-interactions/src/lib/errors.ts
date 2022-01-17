import { Fragile, FragileError } from "@freestuffbot/common"
import { InteractionApplicationCommandCallbackData, ReplyableCommandInteraction, ReplyableComponentInteraction } from "cordo"


export default class Errors {

  public static readonly STATUS_GENERIC = 10_000
  public static readonly STATUS_ERRNO = 10_001
  public static readonly STATUS_NOT_INITIALIZED = 10_010
  public static readonly STATUS_NO_GUILDDATA = 10_011

  //

  public static handleErrorAndCommunicate(error: FragileError, i?: ReplyableCommandInteraction | ReplyableComponentInteraction): InteractionApplicationCommandCallbackData {
    Errors.handleErrorWithoutCommunicate(error)

    const data: InteractionApplicationCommandCallbackData = {
      title: 'An error occured',
      description: `\`${error.status} ${error.name} @${error.source}\``
        + (error.description ? `\n${error.description}` : '')
        + (error.fix ? `\n${error.fix}` : '')
    }

    i?.replyPrivately(data)
    return data
  }

  public static handleErrorWithoutCommunicate(error: FragileError): void {
    // TODO Metrics.log.blabla
  }

  //

  public static success<T>(data: T): Fragile<T> {
    return [ null, data ]
  }

  public static throw(error: FragileError): Fragile<any> {
    return [ error, null ]
  }

  //

  public static throwStderrGeneric(source: string = 'stderr', description?: string, fix?: string): Fragile<any> {
    return Errors.throw({
      status: Errors.STATUS_NOT_INITIALIZED,
      name: 'generic',
      source,
      description,
      fix
    })
  }

  public static throwStderrNotInitialized(): Fragile<any> {
    return Errors.throw({
      status: Errors.STATUS_NOT_INITIALIZED,
      name: 'not initialized',
      source: 'stderr',
      description: 'The data has not been loaded yet.',
      fix: 'Please try again in a few seconds.'
    })
  }

  public static throwStderrNoGuilddata(): Fragile<any> {
    return Errors.throw({
      status: Errors.STATUS_NO_GUILDDATA,
      name: 'no guilddata',
      source: 'stderr',
      description: 'The data for your guild could not be loaded.',
      fix: 'Please try again.'
    })
  }

}
