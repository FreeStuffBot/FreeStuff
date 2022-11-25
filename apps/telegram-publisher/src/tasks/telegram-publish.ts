import { CMS, FSApiGateway, Logger } from '@freestuffbot/common';
import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { sendProduct } from '../lib/message-formatter';


export default async function handleAppsPublish(task: Task<TaskId.TELEGRAM_PUBLISH>): Promise<boolean> {
  const targetChannels = CMS.remoteConfig[ 1 ]?.global?.telegramChannels;
  if (targetChannels === undefined) {
    Logger.warn('Failed to load telegram channels configuration');
    return false;
  }

  const announcementId = task.a;
  const channelIndex = task.b;

  const { chatId, locale } = targetChannels[ channelIndex ];

  if (!chatId) throw new Error('Invalid bucket number: ' + chatId);

  const products = await FSApiGateway.getProductsForAnnouncement(announcementId);
  for (const product of products) await sendProduct(chatId, product, locale);

  return true;
}