import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { AppDataType, AppSanitizer, FSApiGateway, SanitizedProductType } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import UpstreamProxy from "../lib/upstream-proxy"
import Hooks from "../lib/hooks"


export default async function handleAppsPublish(task: Task<TaskId.APPS_PUBLISH>): Promise<boolean> {
  // const bucketCount = task.c
  const bucketNumber = task.b
  const announcementId = task.a

  // TODO (lowest) add proper sharding
  // rn we are just lazily skipping sharding alltogether
  // too few destinations for this to be worth it
  // only bucket 0 will go through and it will contain all eligable apps
  if (bucketNumber !== 0) return true

  const query = {
    // sharder: { $mod: [ bucketCount, bucketNumber ] },
    webhookUrl: { $ne: null }
  }

  const apps = await Mongo.App
    .find(query)
    .lean(true)
    .exec()
    .catch(() => {}) as AppDataType[]

  if (!apps?.length) return true

  const products = await FSApiGateway.getProductsForAnnouncement(announcementId)
  if (!products) return false

  for (const app of apps)
    sendToApp(app, products)

  return true
}

function sendToApp(app: AppDataType, products: SanitizedProductType[]) {
  const sanitizedApp = AppSanitizer.sanitize(app)

  // TODO (low) check webhook version
  const version = 1

  // const filteredProducts = ProductFilter.filterList(products, sanitizedGuild)
  // if (!filteredProducts.length) return

  const payload = Hooks.forVersion(version).packageProducts(products, sanitizedApp)
  UpstreamProxy.sendTo(payload, sanitizedApp)

  return true
}
