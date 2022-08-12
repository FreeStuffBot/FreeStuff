import { Logger } from "@freestuffbot/common"
import { TaskId, TasksForQueue } from "@freestuffbot/rabbit-hole"
import handleAppsPublish from "./telegram-publish"
import handleAppsPublishSplit from "./telegram-publish-split"
import handleAppsResend from "./telegram-resend"
import handleAppsTest from "./telegram-test"


export default class TaskRouter {

  private static readonly UNKNOWN_TASK_DEFER_DELAY = 5000
  
  public static consume(task: TasksForQueue<'TELEGRAM'>): Promise<boolean> {
    Logger.excessive(`Consuming task of type ${task.t}`)

    switch (task.t) {
      case TaskId.TELEGRAM_PUBLISH:
        return handleAppsPublish(task)
      case TaskId.TELEGRAM_RESEND:
        return handleAppsResend(task)
      case TaskId.TELEGRAM_TEST:
        return handleAppsTest(task)
      case TaskId.TELEGRAM_PUBLISH_SPLIT:
        return handleAppsPublishSplit(task)

      default: {
        Logger.warn(`Unhandled Task Type ${(task as TasksForQueue<'TELEGRAM'>).t}, deferring`)
        return new Promise(res => setTimeout(
          () => res(false),
          TaskRouter.UNKNOWN_TASK_DEFER_DELAY
        ))
      }
    }
  }

}
