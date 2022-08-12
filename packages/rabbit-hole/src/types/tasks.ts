import * as amqp from 'amqplib'


export enum Priority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
}

/*
 *
 */

export type TaskQueueType<Name extends string> = {
  name: Name
  options: amqp.Options.AssertQueue
}

export const StaticTypedTaskQueue = {
  DISCORD: {
    name: 'fsb-discord',
    options: {
      durable: true,
      maxPriority: Priority.HIGH
    }
  },
  APPS: {
    name: 'fsb-apps',
    options: {
      durable: true,
      maxPriority: Priority.HIGH
    }
  },
  TELEGRAM: {
    name: 'fsb-telegram',
    options: {
      durable: true,
      maxPriority: Priority.HIGH
    }
  }
} as const

export const TaskQueue: Record<keyof typeof StaticTypedTaskQueue, TaskQueueType<any>> = StaticTypedTaskQueue

export type QueueName = keyof typeof TaskQueue

/*
 *
 */

export enum TaskId {
  /** publish an announcement to multiple guilds */
  DISCORD_PUBLISH = 1,
  /** resend announcements to a single guild */
  DISCORD_RESEND = 2,
  /** send a test message to a single guild */
  DISCORD_TEST = 3,
  /** task to split up remaining guilds into workable chunks */
  DISCORD_PUBLISH_SPLIT = 4,
  /** publish an announcement to multiple apps (webhoook) */
  APPS_PUBLISH = 11,
  /** resend an announcement to a single app webhoook */
  APPS_RESEND = 12,
  /** send a test message to an app webhoook */
  APPS_TEST = 13,
  /** task to split up remaining apps into workable chunks */
  APPS_PUBLISH_SPLIT = 14,
  /** publish an announcement to multiple channels */
  TELEGRAM_PUBLISH = 21,
  /** resend an announcement to a single channel */
  TELEGRAM_RESEND = 22,
  /** send a test message to a channel */
  TELEGRAM_TEST = 23,
  /** task to split up remaining channels into workable chunks */
  TELEGRAM_PUBLISH_SPLIT = 24,
}

export type TaskType = {
  t: TaskId.DISCORD_PUBLISH
  /** bucket number               */ b: number
  /** total bucket count          */ c: number
  /** announcement id             */ a: number
} | {
  t: TaskId.DISCORD_RESEND
  /** guild id as string          */ g: string
  /** list of product ids         */ p: number[]
} | {
  t: TaskId.DISCORD_TEST
  /** guild id as string          */ g: string
} | {
  t: TaskId.DISCORD_PUBLISH_SPLIT
  /** next value to continue with */ v: number
  /** total bucket count          */ c: number
  /** announcement id             */ a: number
} | {
  t: TaskId.APPS_PUBLISH
  /** bucket number               */ b: number
  /** total bucket count          */ c: number
  /** announcement id             */ a: number
} | {
  t: TaskId.APPS_RESEND
  /** app id as string            */ i: string
  /** list of product ids         */ p: number[]
} | {
  t: TaskId.APPS_TEST
  /** app id as string            */ i: string
} | {
  t: TaskId.APPS_PUBLISH_SPLIT
  /** next value to continue with */ v: number
  /** total bucket count          */ c: number
  /** announcement id             */ a: number
} | {
  t: TaskId.TELEGRAM_PUBLISH
  /** bucket number               */ b: number
  /** total bucket count          */ c: number
  /** announcement id             */ a: number
} | {
  t: TaskId.TELEGRAM_RESEND
  /** channel name as string      */ n: string
  /** list of product ids         */ p: number[]
} | {
  t: TaskId.TELEGRAM_TEST
  /** channel name as string      */ n: string
} | {
  t: TaskId.TELEGRAM_PUBLISH_SPLIT
  /** next value to continue with */ v: number
  /** total bucket count          */ c: number
  /** announcement id             */ a: number
}

export type Task<T extends TaskId> = TaskType & { t: T }

export type TaskMetaType<Name extends string> = {
  queue: TaskQueueType<Name>,
  priority: Priority
}

export const StaticTypedTaskMeta = {
  [TaskId.DISCORD_PUBLISH]: { queue: StaticTypedTaskQueue.DISCORD, priority: Priority.MEDIUM },
  [TaskId.DISCORD_RESEND]: { queue: StaticTypedTaskQueue.DISCORD, priority: Priority.HIGH },
  [TaskId.DISCORD_TEST]: { queue: StaticTypedTaskQueue.DISCORD, priority: Priority.HIGH },
  [TaskId.DISCORD_PUBLISH_SPLIT]: { queue: StaticTypedTaskQueue.DISCORD, priority: Priority.LOW },
  [TaskId.APPS_PUBLISH]: { queue: StaticTypedTaskQueue.APPS, priority: Priority.MEDIUM },
  [TaskId.APPS_RESEND]: { queue: StaticTypedTaskQueue.APPS, priority: Priority.HIGH },
  [TaskId.APPS_TEST]: { queue: StaticTypedTaskQueue.APPS, priority: Priority.HIGH },
  [TaskId.APPS_PUBLISH_SPLIT]: { queue: StaticTypedTaskQueue.APPS, priority: Priority.LOW },
  [TaskId.TELEGRAM_PUBLISH]: { queue: StaticTypedTaskQueue.TELEGRAM, priority: Priority.MEDIUM },
  [TaskId.TELEGRAM_RESEND]: { queue: StaticTypedTaskQueue.TELEGRAM, priority: Priority.HIGH },
  [TaskId.TELEGRAM_TEST]: { queue: StaticTypedTaskQueue.TELEGRAM, priority: Priority.HIGH },
  [TaskId.TELEGRAM_PUBLISH_SPLIT]: { queue: StaticTypedTaskQueue.TELEGRAM, priority: Priority.LOW },
} as const

export const TaskMeta: Record<TaskId, TaskMetaType<any>> = StaticTypedTaskMeta

export type TaskIdsForQueue<Q extends QueueName> = keyof {
  [
    K in TaskId as (typeof StaticTypedTaskMeta)[K] extends {
      queue: { name: (typeof StaticTypedTaskQueue[Q])['name'] }
    } ? K : never
  ]: any
}

export type TasksForQueue<Q extends QueueName> = TaskType & { t: TaskIdsForQueue<Q> }
