import { SanitizedTranslateApplicationType, TranslateApplicationDataType } from ".."


export class TranslateApplicationSanitizer {

  public static sanitize(data: TranslateApplicationDataType): SanitizedTranslateApplicationType {
    if (!data) return null
    return {
      id: data._id,
      submitted: data.submitted,
      language: data.language,
      userSince: data.userSince,
      whyThem: data.whyThem,
      whereFrom: data.whereFrom,
      declined: data.declined
    }
  }

}
