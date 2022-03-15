import * as amqp from 'amqplib'


export enum Priority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
}

/*
 *
 */

export type TaskQueueType = {
  name: string
  options: amqp.Options.AssertQueue
}

const TaskQueueData = {
  DISCORD: {
    name: 'fsb-discord',
    options: {
      durable: true,
      maxPriority: Priority.HIGH
    }
  }
}

export const TaskQueue: Record<keyof typeof TaskQueueData, TaskQueueType> = TaskQueueData

export type QueueName = keyof typeof TaskQueue

/*
 *
 */

export enum TaskId {
  /** publish an announcement to multiple guilds */
  DISCORD_PUBLISH = 1,
  /** resend announcements to a single guild */
  DISCORD_RESEND_ONE = 2,
  /** send a test message to a single guild */
  DISCORD_TEST_ONE = 3,
  /** task to split up remaining guilds into workable chunks */
  DISCORD_PUBLISH_SPLIT = 4
}

type TaskType = {
  t: TaskId.DISCORD_PUBLISH
  /** bucket number */
  b: number
  /** total bucket count */
  c: number
  /** announcement id */
  a: number
} | {
  t: TaskId.DISCORD_RESEND_ONE
  /** guild id as string */
  g: string
} | {
  t: TaskId.DISCORD_TEST_ONE
  /** guild id as string */
  g: string
} | {
  t: TaskId.DISCORD_PUBLISH_SPLIT,
  /** next value to continue with */
  v: number
  /** total bucket count */
  c: number
  /** announcement id */
  a: number
}

export type Task<T extends TaskId> = TaskType & { t: T }

export type TaskMetaType = {
  queue: TaskQueueType,
  priority: Priority
}

export const TaskMeta: Record<TaskId, TaskMetaType> = {
  [TaskId.DISCORD_PUBLISH]: { queue: TaskQueue.DISCORD, priority: Priority.MEDIUM },
  [TaskId.DISCORD_RESEND_ONE]: { queue: TaskQueue.DISCORD, priority: Priority.HIGH },
  [TaskId.DISCORD_TEST_ONE]: { queue: TaskQueue.DISCORD, priority: Priority.HIGH },
  [TaskId.DISCORD_PUBLISH_SPLIT]: { queue: TaskQueue.DISCORD, priority: Priority.LOW }
}
