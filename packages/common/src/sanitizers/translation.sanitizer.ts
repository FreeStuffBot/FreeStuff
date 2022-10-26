import { SanitizedTranslationType, TranslationDataType } from ".."


export class TranslationSanitizer {

  public static sanitize(data: TranslationDataType): SanitizedTranslationType {
    if (!data) return null
    return {
      id: data._id,
      parent: data.parent,
      type: data.type,
      text: data.text,
      createdAt: data.createdAt,
      upvotedBy: data.upvotedBy,
      downvotedBy: data.downvotedBy,
      approved: data.approved
    }
  }

}
