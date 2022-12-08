import { Logger, NestedLogger } from '@freestuffbot/common'
import { CronJob } from 'cron'
import { config } from '..'
import Resolver from '../lib/resolver'
import StringUtils from '../lib/string-utils'
import CurrConv from '../services/currconv'
import CleanUpTranslationsRoutine from './clean-up-translations'
import FetchFreebiesRoutine from "./fetch-freebies"


export default class Routines {

  public static start() {
    Routines.stopAll()
    const rule = config.routines

    Routines.register(rule.fetchFreebies, 'Fetch Freebies', FetchFreebiesRoutine.run, true)
    
    Routines.register(rule.clearResolverCache, 'Clear Resolver Cache', Resolver.clearCache, true)
    
    Routines.register(rule.updateCurrConvData, 'Update CurrConv Data', CurrConv.updateData, true)

    Routines.register(rule.cleanUpTranslations, 'Clean Up Translations', CleanUpTranslationsRoutine.run, false)
  }

  //

  private static jobs: CronJob[] = []
  private static currentlyRunning: Set<string> = new Set()

  private static register(schedule: string, name: string, task: (logger: NestedLogger) => any, immediate: boolean) {
    const runner = async () => {
      if (Routines.currentlyRunning.has(name)) {
        Logger.info(`Routine ${name} was scheduled to start now but is still running. Abort.`)
        return
      }

      Routines.currentlyRunning.add(name)
      const routineId = 'r' + StringUtils.generateWord(4, StringUtils.NUMBERS)
      const cLogger = Logger.createNestedLogger(routineId)

      cLogger.info(`Starting routine ${name}`)
      const res = await Promise
        .resolve(task(cLogger))
        .catch(e => (e + ''))

      // no response -> success
      // string -> error message, empty -> success
      // true / false -> obvious
      const success = (res === undefined)
        ? true
        : (typeof res === 'string')
          ? !res
          : !!res
      const error = (typeof res === 'string')
        ? res
        : 'Failed for an unknown reason'

      if (success)
        cLogger.process(`Routine ${name} completed successfully`)
      else
        cLogger.warn(`Routine ${name} completed with errors: ${error}`)

      Routines.currentlyRunning.delete(name)
    }
    const job = new CronJob({
      cronTime: schedule,
      onTick: runner,
      runOnInit: immediate
    })
    Routines.jobs.push(job)
    job.start()
  }

  public static stopAll() {
    for (const job of Routines.jobs)
      job.stop()
    Routines.jobs = []
  }

}
