import { Logger } from "@freestuffbot/common"
import { TaskId, TasksForQueue } from "@freestuffbot/rabbit-hole"
import handleAppsPublish from "./apps-publish"
import handleAppsPublishSplit from "./apps-publish-split"
import handleAppsResend from "./apps-resend"
import handleAppsTest from "./apps-test"


export default class TaskRouter {

  private static readonly UNKNOWN_TASK_DEFER_DELAY = 5000
  
  public static consume(task: TasksForQueue<'APPS'>): Promise<boolean> {
    Logger.excessive(`Consuming task of type ${task.t}`)

    switch (task.t) {
      case TaskId.APPS_PUBLISH:
        return handleAppsPublish(task)
      case TaskId.APPS_RESEND:
        return handleAppsResend(task)
      case TaskId.APPS_TEST:
        return handleAppsTest(task)
      case TaskId.APPS_PUBLISH_SPLIT:
        return handleAppsPublishSplit(task)

      default: {
        Logger.warn(`Unhandled Task Type ${(task as TasksForQueue<'APPS'>).t}, deferring`)
        return new Promise(res => setTimeout(
          () => res(false),
          TaskRouter.UNKNOWN_TASK_DEFER_DELAY
        ))
      }
    }
  }

}
