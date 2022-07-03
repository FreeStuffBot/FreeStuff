import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { AppDataType, AppSanitizer } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import LocalConst from "../lib/local-const"
import UpstreamProxy from "../lib/upstream-proxy"
import Hooks from "../lib/hooks"


export default async function handleAppsTest(task: Task<TaskId.APPS_TEST>): Promise<boolean> {
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
  const products = [ LocalConst.TEST_RUN_PRODUCT ]

  const payload = Hooks.forVersion(version).packageProducts(products, sanitizedApp)
  UpstreamProxy.sendTo(payload, sanitizedApp)

  return true
}
