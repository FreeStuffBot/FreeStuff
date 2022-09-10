/* eslint-disable no-console */
import chalk from 'chalk'
import CMS from './cms'


/**
 * Gets a colorized timestamp with the format `XX:XX:XX`
 * @returns The formatted timestamp.
 */
function getTimestamp() {
  const d = new Date()
  return chalk`{gray ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}} `
}

/**
 * A simple utility class wrapping the `console` module for outputting logs.
 *
 * It prefixes the log messages with a timestamp, colorizes them, and adds a character indicating the message type.
 *
 * ### Logging Levels:
 *
 *  - `>` **(cyan):** Normal log messages.
 *  - `!` **(yellow):** Warning log messages.
 *  - `X` **(red):** Error log messages.
 *  - `•` **(white):** Debug log messages.
 *  - `i` **(blue):** Info log messages.
 *  - `√` **(green):** Process log messages.
 *  - `M` **(green):** Manager log messages.
 *  - `#` **(magenta):** Excessive log messages.
 */
export class Logger {

  /**
   * Logs a normal message, gets prefixed with a cyan `>` and a timestamp.
   * @param text The message to log.
   */
   public static log(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.log(getTimestamp() + chalk`{cyan >} {white ${out}}`)
  }

  /**
   * Logs a warning message, gets prefixed with a yellow `!` and a timestamp.
   * @param text The message to log.
   */
  public static warn(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.warn(getTimestamp() + chalk`{yellow !} {yellowBright ${out}}`)
  }

  /**
   * Logs an error message, gets prefixed with a red `X` and a timestamp.
   * @param text The message to log.
   */
  public static error(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.error(getTimestamp() + chalk`{red X} {redBright ${out}}`)
  }

  /**
   * Logs a debug message, gets prefixed with a white `•` and a timestamp.
   * @param text The message to log.
   */
  public static debug(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.log(getTimestamp() + chalk`{white •} {white ${out}}`)
  }

  /**
   * Logs an info message, gets prefixed with a blue `i` and a timestamp.
   * @param text The message to log.
   */
  public static info(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(getTimestamp() + chalk`{blue i} {white ${out}}`)
  }

  /**
   * Logs a process message, gets prefixed with a green `√` and a timestamp.
   * @param text The message to log.
   */
  public static process(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(getTimestamp() + chalk`{green √} {white ${out}}`)
  }

  /**
   * Logs a debug message ONLY IF excessive logging is enabled, does nothing otherwise
   * Gets prefixed with a magenta `#` and a timestamp.
   * @param text The message to log.
   */
  public static excessive(...text: string[]) {
    if (!CMS.remoteConfig[1]?.global?.excessiveLogging) return
    const out = text.join(chalk.gray(', '))
    console.info(getTimestamp() + chalk`{magenta #} {white ${out}}`)
  }

  //

  public static createNestedLogger(prefix: string): NestedLogger {
    return new NestedLogger(prefix)
  }

}

export class NestedLogger {

  private readonly prefix: string
  
  constructor(
    private readonly rawPrefix: string
  ) {
    this.prefix = chalk`{gray ${rawPrefix} | }`
  }
  
  /**
   * Logs a normal message, gets prefixed with a cyan `>` and a timestamp.
   * @param text The message to log.
   */
  public log(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.log(getTimestamp() + this.prefix + chalk`{cyan >} {white ${out}}`)
  }

  /**
   * Logs a warning message, gets prefixed with a yellow `!` and a timestamp.
   * @param text The message to log.
   */
  public warn(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.warn(getTimestamp() + this.prefix + chalk`{yellow !} {yellowBright ${out}}`)
  }

  /**
   * Logs an error message, gets prefixed with a red `X` and a timestamp.
   * @param text The message to log.
   */
  public error(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.error(getTimestamp() + this.prefix + chalk`{red X} {redBright ${out}}`)
  }

  /**
   * Logs a debug message, gets prefixed with a white `•` and a timestamp.
   * @param text The message to log.
   */
  public debug(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.log(getTimestamp() + this.prefix + chalk`{white •} {white ${out}}`)
  }

  /**
   * Logs an info message, gets prefixed with a blue `i` and a timestamp.
   * @param text The message to log.
   */
  public info(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(getTimestamp() + this.prefix + chalk`{blue i} {white ${out}}`)
  }

  /**
   * Logs a process message, gets prefixed with a green `√` and a timestamp.
   * @param text The message to log.
   */
  public process(...text: string[]) {
    const out = text.join(chalk.gray(', '))
    console.info(getTimestamp() + this.prefix + chalk`{green √} {white ${out}}`)
  }

  /**
   * Logs a debug message ONLY IF excessive logging is enabled, does nothing otherwise
   * Gets prefixed with a magenta `#` and a timestamp.
   * @param text The message to log.
   */
  public excessive(...text: string[]) {
    if (!CMS.remoteConfig[1]?.global?.excessiveLogging) return
    const out = text.join(chalk.gray(', '))
    console.info(getTimestamp() + this.prefix + chalk`{magenta #} {white ${out}}`)
  }

  //

  public createNestedLogger(prefix: string): NestedLogger {
    return new NestedLogger(`${this.rawPrefix} | ${prefix}`)
  }

}
