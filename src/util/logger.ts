/* eslint-disable no-console */
import * as chalk from 'chalk'


export default class Logger {

  private static getTimestamp() {
    const d = new Date()
    return chalk`{gray ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}} `
  }

  public static log(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.log(this.getTimestamp() + chalk`{cyan >} {white ${out}}`)
  }

  public static warn(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.warn(this.getTimestamp() + chalk`{yellow !} {yellowBright ${out}}`)
  }

  public static error(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.error(this.getTimestamp() + chalk`{red X} {redBright ${out}}`)
  }

  public static debug(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.log(this.getTimestamp() + chalk`{white •} {white ${out}}`)
  }

  public static info(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(this.getTimestamp() + chalk`{blue i} {white ${out}}`)
  }

  public static process(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(this.getTimestamp() + chalk`{green √} {white ${out}}`)
  }

  public static manager(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(this.getTimestamp() + chalk`{green M} {white ${out}}`)
  }

}
