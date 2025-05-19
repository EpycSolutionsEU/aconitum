/**
 * Converts the first character of a string to upper case and the remaining to lower case.
 * 
 * This function handles complex Unicode characters correctly, including:
 * - Surrogate pairs
 * - Combining marks
 * - Regional indicators
 * - Zero-width joiners
 * - Variation selectors
 * 
 * Common use cases include:
 * - Normalizing user input
 * - Formatting names or titles consistently
 * - Implementing text transformation utilities
 * - Standardizing display of text data
 * 
 * @param { string } [string=''] - The string to convert.
 * 
 * @example
 * ```typescript
 * import { capitalize } from '@aconitum/utils';
 * 
 * // Basic usage
 * capitalize('fred');
 * // => 'Fred'
 * 
 * // Mixed case
 * capitalize('FRED');
 * // => 'Fred'
 * 
 * // Empty string
 * capitalize('');
 * // => ''
 * 
 * // Unicode characters
 * capitalize('über');
 * // => 'Über'
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { string } Returns the capitalized string
 * @throws { TypeError } Throws if the input cannot be converted to a string
 */

import upperFirst from './upper-first.js'

/**
 * Converts the first character of `string` to upper case and the remaining to lower case.
 *
 * @param { string } [string=''] - The string to convert
 * 
 * @returns { string } Returns the capitalized string
 * @throws { TypeError } Throws if the input cannot be converted to a string
 */
function capitalize(string: string = ''): string {
  try {
    return upperFirst(string.toLowerCase())
  } catch (error) {
    throw new TypeError('Input cannot be converted to a string')
  }
}

export default capitalize