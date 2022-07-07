import * as amqp from 'amqplib'
import { QueueName, Task, TaskId, TaskMeta, TaskQueue, TasksForQueue } from './types/tasks'


export default class RabbitHole {

  private static connection: amqp.Connection
  private static channel: amqp.Channel
  private static subscription: amqp.Replies.Consume

  private static initPendingQueue: [string, Buffer, amqp.Options.Publish][] = []

  public static async open(uri: string, maxRetries = 3, retryDelay = 5000): Promise<void> {
    try {
      RabbitHole.connection = await amqp.connect(uri)
      RabbitHole.channel = await RabbitHole.connection.createChannel()

      for (const queued of RabbitHole.initPendingQueue)
        RabbitHole.channel.sendToQueue(...queued)
    } catch (ex) {
      if (maxRetries > 0) {
        await new Promise(res => setTimeout(res, retryDelay))
        return RabbitHole.open(uri, maxRetries - 1, retryDelay)
      }

      // eslint-disable-next-line no-console
      console.error('Opening rabbit hole failed. Shutting down.')
      // eslint-disable-next-line no-console
      console.error(ex)

      process.exit(1)
    }
  }

  /*
   *
   */

  public static publish(task: Task<TaskId>, overrideQueue?: QueueName): void {
    const queue = overrideQueue
      ? TaskQueue[overrideQueue]
      : TaskMeta[task.t].queue

    const options: amqp.Options.Publish = {
      persistent: true,
      priority: TaskMeta[task.t].priority
    }

    // if the channel is not yet connected, put it in a queue to be published once connected
    if (!RabbitHole.channel) {
      RabbitHole.initPendingQueue.push([
        queue.name,
        Buffer.from(JSON.stringify(task)),
        options  
      ])
      return
    }

    RabbitHole.channel.sendToQueue(
      queue.name,
      Buffer.from(JSON.stringify(task)),
      options
    )
  }

  /**
   * Subscribe to a task
   * @param task the taskid to subscribe to
   * @param handler 
   */
  public static async subscribe<Q extends QueueName>(
    queueName: Q,
    handler: (task: TasksForQueue<Q>) => Promise<boolean>
  ): Promise<void> {
    if (RabbitHole.subscription) throw new Error('This Rabbit Hole has already been subscribed to a queue.')

    const queue = TaskQueue[queueName]
    RabbitHole.channel.assertQueue(queue.name, queue.options)
    RabbitHole.channel.prefetch(1)

    const internalHandler = (msg: amqp.ConsumeMessage) => !msg?.content
      ? void RabbitHole.channel.ack(msg)
      : handler(JSON.parse(msg.content.toString()))
        .then(ack => ack ? 'ack' : 'nack')
        .then(fun => RabbitHole.channel[fun](msg))
        .catch(() => {})

    RabbitHole.subscription = await RabbitHole.channel.consume(
      queue.name,
      internalHandler,
      { noAck: false }
    )
  }

  public static unsubscribe() {
    if (RabbitHole.subscription)
      RabbitHole.channel.cancel(RabbitHole.subscription.consumerTag)
  }

}
