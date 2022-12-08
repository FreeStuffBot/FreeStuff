import { NestedLogger } from "@freestuffbot/common"


export default class CleanUpTranslationsRoutine {

  public static async run(_logger: NestedLogger) {
    // TODO

    /**

    TODO translation website:
    X - allow maintainers to mark one(!) comment as approved
    X - automatically merge the correct translation if one gets approved or one gets upvoted
    - add task to delete old suggestions with no upvotes
    X - allow users to add new suggestions
    X   * check if text is same as another suggestion -> cast upvote
    X   * check if already suggested something (see below)


    List of suggestions

    Top one: accepted one
    Then by votes, descending

    Add downvotes. Suggestions with -2 or less, older than a month get deleted
    If no suggestion is accepted, use the highest voted one, only if it has more than 2 upvotes

    If you update your suggestion:
    * check if the text is the same as another suggestion, if so, cast upvote instead
    - your current one is not accepted:
      * re-create suggestion, removing upvotes and downvotes
      * do not re-create if new text == old text
      * only allow one update per hour, per suggestion (so people can't just clear their downvotes)
    - your current one IS accepted:
      * move current suggestion over to a pseudo-user
      * create new suggestion for that user
      * warn about it
      * if user is language maintainer and it's their suggestion: just update without re-creating -> instant update without checks

    */
  }

}
