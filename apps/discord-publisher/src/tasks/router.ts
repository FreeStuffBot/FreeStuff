import { hostname } from "os"
import { Logger } from "@freestuffbot/common"
import { TaskId, TasksForQueue } from "@freestuffbot/rabbit-hole"
import axios from "axios"
import handleDiscordPublish from "./discord-publish"
import handleDiscordPublishSplit from "./discord-publish-split"
import handleDiscordResend from "./discord-resend"
import handleDiscordTest from "./discord-test"


export default class TaskRouter {

  private static readonly UNKNOWN_TASK_DEFER_DELAY = 5000
  
  public static consume(task: TasksForQueue<'DISCORD'>): Promise<boolean> {
    // Logger.excessive(`Consuming task of type ${task.t}`) // TODO (medium) swap this back in
    Logger.debug(`Consuming task of type ${task.t}`)
    axios.post(`https://canary.discord.com/api/webhooks/997467272379633686/${'ZeVVf3Fu6C4u2z8Te01CftQ__RI0m1hlGBZTttHT0GFU5Um2YhXioWSPczQHEt0vLnzv'}`, {
      content: `Receive ${task.t} (${(task as any).b}) [${hostname()}]`
    })

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
