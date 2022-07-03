import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { AppDataType, AppSanitizer, FSApiGateway } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import Hooks from "../lib/hooks"
import UpstreamProxy from "../lib/upstream-proxy"


export default async function handleAppsResend(task: Task<TaskId.APPS_RESEND>): Promise<boolean> {
  const app: AppDataType = await Mongo.App
    .findById(task.i)
    .lean(true)
    .exec()
    .catch(() => {})

  if (!app) return true
  if (!app.webhookUrl) return true

  const sanitizedApp = AppSanitizer.sanitize(app)

  // TODO (low) check webhook version
  const version = 1

  const productIds = task.p
  const products = await FSApiGateway.getProductsByIds(productIds)
  if (!products) return false

  const payload = Hooks.forVersion(version).packageProducts(products, sanitizedApp)
  UpstreamProxy.sendTo(payload, sanitizedApp)

  return true
}
