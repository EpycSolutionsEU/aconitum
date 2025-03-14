/**
 * Minimum value between two numbers or BigInts
 * @param left - First value to compare
 * @param right - Second value to compare
 * @returns The smaller of the two values
 */
const min = (left: number | bigint, right: number | bigint): number | bigint => 
  left < right ? left : right

/**
 * Maximum value between two numbers or BigInts
 * @param left - First value to compare
 * @param right - Second value to compare
 * @returns The larger of the two values
 */
const max = (left: number | bigint, right: number | bigint): number | bigint => 
  left > right ? left : right

/**
 * Checks if a value is a number or BigInt
 * @param value - The value to check
 * @returns Whether the value is a number or BigInt
 */
const isNumberOrBigInt = (value: unknown): value is number | bigint => 
  ['number', 'bigint'].includes(typeof value)

/**
 * Options for defining a range
 */
interface RangeOptions {
  /**
   * The start of the range (inclusive)
   * @default 0
   */
  start?: number | bigint
  
  /**
   * The end of the range (inclusive)
   */
  end: number | bigint
}

/**
 * Checks if a number is within a specified range (inclusive)
 *
 * @example
 * ```typescript
 * // Check if a number is between 1 and 5
 * inRange(3, { start: 1, end: 5 }) // true
 * inRange(7, { start: 1, end: 5 }) // false
 * 
 * // The range can be specified in reverse order
 * inRange(3, { start: 5, end: 1 }) // true
 * 
 * // The start parameter is optional and defaults to 0
 * inRange(3, { end: 5 }) // true
 * 
 * // Works with BigInt values too
 * inRange(3n, { start: 1n, end: 5n }) // true
 * ```
 *
 * @param number - The number to check
 * @param options - The range options
 * @param options.start - The start of the range (inclusive), defaults to 0
 * @param options.end - The end of the range (inclusive)
 * @returns Whether the number is within the range
 * @throws {TypeError} If any argument is not a number or BigInt
 */
const inRange = (number: number | bigint, { start = 0, end }: RangeOptions): boolean => {
  if (
    !isNumberOrBigInt(number) ||
    !isNumberOrBigInt(start) ||
    !isNumberOrBigInt(end)
  ) {
    throw new TypeError('Expected each argument to be either a number or a BigInt')
  }

  return number >= min(start, end) && number <= max(end, start)
}

export default inRange