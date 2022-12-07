import { Logger } from "@freestuffbot/common"
import { TaskId, TasksForQueue } from "@freestuffbot/rabbit-hole"
import handleDiscordPublish from "./discord-publish"
import handleDiscordPublishSplit from "./discord-publish-split"
import handleDiscordResend from "./discord-resend"
import handleDiscordTest from "./discord-test"


export default class TaskRouter {

  private static readonly UNKNOWN_TASK_DEFER_DELAY = 5000
  
  public static consume(task: TasksForQueue<'DISCORD'>): Promise<boolean> {
    switch (task.t) {
      case TaskId.DISCORD_PUBLISH:
        return handleDiscordPublish(task)
      case TaskId.DISCORD_RESEND:
        return handleDiscordResend(task)
      case TaskId.DISCORD_TEST:
        return handleDiscordTest(task)
      case TaskId.DISCORD_PUBLISH_SPLIT:
        return handleDiscordPublishSplit(task)

      default: {
        Logger.warn(`Unhandled Task Type ${(task as TasksForQueue<'DISCORD'>).t}, deferring`)
        return new Promise(res => setTimeout(
          () => res(false),
          TaskRouter.UNKNOWN_TASK_DEFER_DELAY
        ))
      }
    }
  }

}
