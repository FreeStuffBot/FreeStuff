import RabbitHole, { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { config } from '../';

/*
PUBLISH_SPLIT is triggered a single time by the system when it's a new announcement is published.
  (You can find it in apps/api/src/lib/upstream.ts -> publishToTelegram method).

The "announcementBucketCount" is hardcoded to 1. (which is the 'c' field of the task).
The 'a' field is the announcement id, query the CMS to get the full product details.
The 'v' field is fixed to 0.

It's expected from this implementation to queue the subsequent PUBLISH_SPLIT tasks,
and when that is done, due to the priorities of tasks consumption,
all the queued PUBLISH tasks are consumed before the next PUBLISH_SPLIT one is consumed.

Check packages/rabbit-hole/src/types/tasks.ts to figure out the structure of the task object.
*/

export default async function handleAppsPublishSplit(task: Task<TaskId.TELEGRAM_PUBLISH_SPLIT>): Promise<boolean> {
  const targetChannels = config.telegram.channels;

  const totalBuckets = task.c;
  const totalChannels = targetChannels.length;

  const announcementId = task.a;

  const firstChannelIndex = task.v;
  const lastChannelIndex = Math.min(firstChannelIndex + Math.ceil(totalChannels / totalBuckets), totalChannels); // (excluded)

  for (let channelIndex=firstChannelIndex; channelIndex < lastChannelIndex; channelIndex++) {
    await RabbitHole.publish({
      t: TaskId.TELEGRAM_PUBLISH,
      a: announcementId,
      b: channelIndex,
      c: totalBuckets,
    })
  }

  if (lastChannelIndex !== totalChannels) {
    await RabbitHole.publish({
      t: TaskId.TELEGRAM_PUBLISH_SPLIT,
      a: announcementId,
      c: totalBuckets,
      v: lastChannelIndex,
    });
  }

  return true;
}
