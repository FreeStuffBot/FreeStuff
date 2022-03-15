import * as amqp from 'amqplib'
import { QueueName, Task, TaskId, TaskMeta, TaskQueue, TaskQueueType } from './types/tasks'


export default class RabbitHole {

  private static connection: amqp.Connection
  private static channel: amqp.Channel

  private static subscription: amqp.Replies.Consume

  public static async open(uri: string, queue: TaskQueueType): Promise<void> {
    RabbitHole.connection = await amqp.connect(uri)
    RabbitHole.channel = await RabbitHole.connection.createChannel()

    RabbitHole.channel.assertQueue(queue.name, queue.options)
    RabbitHole.channel.prefetch(1)
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
    queue: Q,
    handler: (task: Task<TaskId>) => Promise<boolean>
  ): Promise<void> {
    if (RabbitHole.subscription) throw new Error('This Rabbit Hole has already been subscribed to a queue.')

    const internalHandler = (msg: amqp.ConsumeMessage) => !msg?.content
      ? void RabbitHole.channel.ack(msg)
      : handler(JSON.parse(msg.content.toString()))
        .then(ack => ack ? 'ack' : 'nack')
        .then(fun => RabbitHole.channel[fun](msg))
        .catch(() => {})

    RabbitHole.subscription = await RabbitHole.channel.consume(
      TaskQueue[queue].name,
      internalHandler,
      { noAck: false }
    )
  }

  public static unsubscribe() {
    if (RabbitHole.subscription)
      RabbitHole.channel.cancel(RabbitHole.subscription.consumerTag)
  }

}
