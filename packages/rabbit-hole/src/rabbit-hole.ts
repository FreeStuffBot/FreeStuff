import * as amqp from 'amqplib'
import { QueueName, Task, TaskId, TaskMeta, TaskQueue, TasksForQueue } from './types/tasks'


export default class RabbitHole {

  private static connection: amqp.Connection = null
  private static channel: amqp.Channel = null
  private static subscription: amqp.Replies.Consume = null

  private static initPendingQueue: [Task<TaskId>, QueueName?][] = []
  private static initUri: string = null

  public static async open(uri: string, maxRetries = 3, retryDelay = 5000): Promise<void> {
    RabbitHole.initUri = uri

    try {
      RabbitHole.connection = await amqp.connect(uri)
      RabbitHole.channel = await RabbitHole.connection.createChannel()

      for (const [ task, overrideQueue ] of RabbitHole.initPendingQueue)         
        await this.publish(task, overrideQueue)

      RabbitHole.connection.once('close', RabbitHole.onClose)
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

  private static async onClose() {
      // eslint-disable-next-line no-console
    console.warn('Rabbit hole closed unexpectedly. Attempting to re-open.')

    await RabbitHole.open(RabbitHole.initUri)

      // eslint-disable-next-line no-console
    console.warn('Rabbit hole re-opened.')
  }

  /*
   *
   */

  /** @returns if success */
  public static async publish(task: Task<TaskId>, overrideQueue?: QueueName): Promise<boolean> {
    // if the channel is not yet connected, put it in a queue to be published once connected
    if (!RabbitHole.channel) {
      RabbitHole.initPendingQueue.push([ task, overrideQueue ])
      return true
    }

    const queue = overrideQueue
      ? TaskQueue[overrideQueue]
      : TaskMeta[task.t].queue

    const options: amqp.Options.Publish = {
      persistent: true,
      mandatory: true,
      priority: TaskMeta[task.t].priority
    }

    let attempt = 0
    do {
      const success = RabbitHole.channel.sendToQueue(
        queue.name,
        Buffer.from(JSON.stringify(task)),
        options
      )
      if (success) return true
      attempt++
      if (attempt > 10) return false
      //  1 |  2 |  3 |   4 |   5 |   6 |    7 |    8 |    9 |    10
      // 20 | 40 | 80 | 160 | 320 | 640 | 1280 | 2560 | 5120 | 10240
      await new Promise(res => setTimeout(res, (2 ** attempt) * 10))
    } while (true)
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
    if (RabbitHole.subscription)
      throw new Error('This Rabbit Hole has already been subscribed to a queue.')

    const queue = TaskQueue[queueName]
    RabbitHole.channel.assertQueue(queue.name, queue.options)
    RabbitHole.channel.prefetch(1)

    const internalHandler = (msg: amqp.ConsumeMessage) => !msg?.content
      ? void RabbitHole.channel.ack(msg)
      : handler(JSON.parse(msg.content.toString()))
        .then(ack => RabbitHole.channel[ack ? 'ack' : 'nack'](msg))
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          RabbitHole.channel.nack(msg)
        });

    RabbitHole.subscription = await RabbitHole.channel.consume(
      queue.name,
      internalHandler,
      { noAck: false }
    )
  }

  public static unsubscribe() {
    if (RabbitHole.subscription)
      RabbitHole.channel.cancel(RabbitHole.subscription.consumerTag)
    RabbitHole.subscription = null
  }

}
