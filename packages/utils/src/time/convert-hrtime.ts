/**
 * Interface for the return value of the convertHrtime function
 */
export interface HrtimeResult {
    /** Time in seconds (floating point) */
    seconds: number
    /** Time in milliseconds (floating point) */
    milliseconds: number
    /** Time in nanoseconds (original value) */
    nanoseconds: number
  }
  
  /**
   * Converts a high-resolution time measurement to different time units
   * 
   * This function takes a high-resolution time value in nanoseconds and converts it to
   * seconds, milliseconds, and the original nanoseconds value. It's useful for processing
   * the results of Node.js process.hrtime() or performance measurements.
   * 
   * @param hrtime - The high-resolution time value in nanoseconds (bigint or number)
   * @returns An object containing the time in seconds, milliseconds, and nanoseconds
   * 
   * @example
   * // Using with process.hrtime.bigint()
   * const start = process.hrtime.bigint()
   * // ... some operation
   * const end = process.hrtime.bigint()
   * const duration = end - start
   * const result = convertHrtime(duration)
   * console.log(`Operation took ${result.milliseconds} ms`)
   */
  export default function convertHrtime(hrtime: bigint | number): HrtimeResult {
    const nanoseconds = hrtime
    const number = Number(nanoseconds)
    const milliseconds = number / 1000000
    const seconds = number / 1000000000
  
    return {
      seconds,
      milliseconds,
      nanoseconds: number
    }
  }