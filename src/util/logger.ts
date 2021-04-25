/* eslint-disable no-console */
import * as chalk from 'chalk'


export default class Logger {

  public static log(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.log(chalk`{gray [{cyan LOG}]} {white ${out}}`)
  }

  public static warn(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.warn(chalk`{gray [{yellow WARN}]} {yellowBright ${out}}`)
  }

  public static error(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.error(chalk`{gray [{red ERROR}]} {redBright ${out}}`)
  }

  public static debug(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.log(chalk`{gray [{white DEBUG}]} {white ${out}}`)
  }

  public static info(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(chalk`{gray [{blue INFO}]} {white ${out}}`)
  }

  public static process(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(chalk`{gray [{green BOT}]} {white ${out}}`)
  }

  public static manager(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(chalk`{gray [{green MANAGER}]} {white ${out}}`)
  }

}
