/* eslint-disable no-console */
import * as chalk from 'chalk'


export default class Logger {

  public static log(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.log(chalk`{gray {cyan >}} {white ${out}}`)
  }

  public static warn(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.warn(chalk`{gray {yellow !}} {yellowBright ${out}}`)
  }

  public static error(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.error(chalk`{gray {red X}} {redBright ${out}}`)
  }

  public static debug(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.log(chalk`{gray {white •}} {white ${out}}`)
  }

  public static info(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(chalk`{gray {blue i}} {white ${out}}`)
  }

  public static process(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(chalk`{gray {green √}} {white ${out}}`)
  }

  public static manager(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(chalk`{gray {green M}} {white ${out}}`)
  }

}
