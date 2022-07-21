import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import RabbitHole from '@freestuffbot/rabbit-hole'
import { config } from ".."


export default async function handleDiscordPublishSplit(task: Task<TaskId.DISCORD_PUBLISH_SPLIT>): Promise<boolean> {
  const amount = config.behavior.publishSplitTaskAmount

  for (let i = 0; i < amount; i++) {
    if (task.v + i >= task.c)
      return Promise.resolve(true)

    await RabbitHole.publish({
      t: TaskId.DISCORD_PUBLISH,
      a: task.a,
      b: task.v + i,
      c: task.c
    })
  }

  await RabbitHole.publish({
    t: TaskId.DISCORD_PUBLISH_SPLIT,
    a: task.a,
    c: task.c,
    v: task.v + amount
  })

  return true
}
