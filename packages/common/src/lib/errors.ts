import { InteractionApplicationCommandCallbackData, ReplyableCommandInteraction, ReplyableComponentInteraction } from "cordo"
import { Fragile, FragileError } from "../struct/fragile.struct"


export default class Errors {

  public static readonly HTTP_STATUS_CONFLICT = 409

  // misc / internal errors
  public static readonly STATUS_GENERIC = 10_000
  public static readonly STATUS_ERRNO = 10_001
  public static readonly STATUS_INTERNAL = 10_002

  // missing / invalid state errors
  public static readonly STATUS_NOT_INITIALIZED = 10_010
  public static readonly STATUS_NO_GUILDDATA = 10_011

  // user errors
  public static readonly STATUS_MISPERM_WEBHOOKS = 10_100

  //

  private static errorHandler: (error: FragileError) => any

  public static createErrorHandler(handler: (error: FragileError) => any): void {
    Errors.errorHandler = handler
  }

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
    Errors.errorHandler?.(error)
  }

  //

  public static success<T>(data: T): Fragile<T> {
    return [ null, data ]
  }

  public static throw(error: FragileError): Fragile<any> {
    return [ error, null ]
  }

  //

  public static throwInternal(source: string = 'stderr'): Fragile<any> {
    return Errors.throw({
      status: Errors.STATUS_GENERIC,
      name: 'internal',
      source
    })
  }

  public static throwStderrGeneric(source: string = 'stderr', description?: string, fix?: string): Fragile<any> {
    return Errors.throw({
      status: Errors.STATUS_NOT_INITIALIZED,
      name: 'generic',
      source,
      description,
      fix
    })
  }

  public static throwStderrNotInitialized(source: string = 'stderr'): Fragile<any> {
    return Errors.throw({
      status: Errors.STATUS_NOT_INITIALIZED,
      name: 'not initialized',
      source,
      description: 'The data has not been loaded yet.',
      fix: 'Please try again in a few seconds.'
    })
  }

  public static throwStderrNoGuilddata(source: string = 'stderr'): Fragile<any> {
    return Errors.throw({
      status: Errors.STATUS_NO_GUILDDATA,
      name: 'no guilddata',
      source,
      description: 'The data for your guild could not be loaded.',
      fix: 'Please try again.'
    })
  }

}
