import convertHrtime, { HrtimeResult } from './convert-hrtime'

/**
 * Type for the time unit to retrieve from the timer
 */
type TimeUnit = keyof HrtimeResult

/**
 * Interface for the timer function returned by timeSpan
 */
interface TimeSpanTimer {
  /**
   * Returns the elapsed time in milliseconds
   * @returns The elapsed time in milliseconds
   */
  (): number

  /**
   * Returns the elapsed time in milliseconds, rounded to the nearest integer
   * @returns The rounded elapsed time in milliseconds
   */
  rounded(): number

  /**
   * Returns the elapsed time in seconds
   * @returns The elapsed time in seconds
   */
  seconds(): number

  /**
   * Returns the elapsed time in nanoseconds
   * @returns The elapsed time in nanoseconds
   */
  nanoseconds(): number
}

/**
 * Creates a high-resolution timer to measure elapsed time
 * 
 * This function creates a timer that uses Node.js's high-resolution time
 * measurement capabilities to track elapsed time with nanosecond precision.
 * The returned function can be called to get the elapsed time in different units.
 * 
 * @returns A function that returns the elapsed time in milliseconds by default,
 *          with additional methods for other time units
 * 
 * @example
 * // Basic usage
 * const timer = timeSpan()
 * // ... some operation
 * console.log(`Operation took ${timer()} ms`)
 * 
 * @example
 * // Using different time units
 * const timer = timeSpan()
 * // ... some operation
 * console.log(`Operation took ${timer.seconds()} seconds`)
 * console.log(`Operation took ${timer.rounded()} ms (rounded)`)
 * console.log(`Operation took ${timer.nanoseconds()} ns`)
 */
export default function timeSpan(): TimeSpanTimer {
  const start = process.hrtime.bigint()
  const end = (type: TimeUnit) => convertHrtime(process.hrtime.bigint() - start)[type]

  const returnValue = () => end('milliseconds')
  returnValue.rounded = () => Math.round(end('milliseconds'))
  returnValue.seconds = () => end('seconds')
  returnValue.nanoseconds = () => end('nanoseconds')

  return returnValue as TimeSpanTimer
}