
export const PublishReportEvent = [
  // begin publishing
  'begin',
  // complete as intended
  'complete-normal',
  // skip errorless because bucket was empty
  'complete-empty',
  // abort publishing because product gateway failed
  'abort-product-gateway',
  // abort publishing because database gateway failed
  'abort-database-gateway'
] as const
export const PublishReportEventArray = PublishReportEvent as readonly string[]
export type PublishReportEventType = typeof PublishReportEvent[number]
