import { TaskId, TasksForQueue } from "@freestuffbot/rabbit-hole"
import handleDiscordPublish from "./discord-publish"
import handleDiscordPublishSplit from "./discord-publish-split"
import handleDiscordTestOne from "./discord-test-one"


export default class TaskRouter {

  private static readonly UNKNOWN_TASK_DEFER_DELAY = 5000
  
  public static consume(task: TasksForQueue<'DISCORD'>): Promise<boolean> {
    switch (task.t) {
      case TaskId.DISCORD_PUBLISH:
        return handleDiscordPublish(task)
      case TaskId.DISCORD_TEST_ONE:
        return handleDiscordTestOne(task)
      case TaskId.DISCORD_PUBLISH_SPLIT:
        return handleDiscordPublishSplit(task)

      default: {
        console.warn('Unhandled Task Type %s, deferring', task.t)
        return new Promise((res) => setTimeout(
          () => res(false),
          TaskRouter.UNKNOWN_TASK_DEFER_DELAY
        ))
      }
    }
  }

}
