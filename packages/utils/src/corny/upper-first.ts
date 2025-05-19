/**
 * Converts the first character of a string to upper case.
 * 
 * This function handles complex Unicode characters correctly, including:
 * - Surrogate pairs
 * - Combining marks
 * - Regional indicators
 * - Zero-width joiners
 * - Variation selectors
 * 
 * Common use cases include:
 * - Capitalizing names or titles
 * - Formatting text for display
 * - Normalizing user input
 * - Implementing text transformation utilities
 * 
 * @param { string } [string=''] - The string to convert.
 * 
 * @example
 * ```typescript
 * import { upperFirst } from '@aconitum/utils';
 * 
 * // Basic usage
 * upperFirst('fred');
 * // => 'Fred'
 * 
 * // Already capitalized
 * upperFirst('FRED');
 * // => 'FRED'
 * 
 * // Empty string
 * upperFirst('');
 * // => ''
 * 
 * // Unicode characters
 * upperFirst('über');
 * // => 'Über'
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { string } Returns the converted string
 * @throws { TypeError } Throws if the input cannot be converted to a string
 */

// Used as references for various `Number` constants
const INFINITY = 1 / 0

// `Object#toString` result references
const symbolTag = '[object Symbol]'

// Used to compose unicode character classes
const rsAstralRange = '\\ud800-\\udfff'
const rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23'
const rsComboSymbolsRange = '\\u20d0-\\u20f0'
const rsVarRange = '\\ufe0e\\ufe0f'

// Used to compose unicode capture groups
const rsAstral = '[' + rsAstralRange + ']'
const rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']'
const rsFitz = '\\ud83c[\\udffb-\\udfff]'
const rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')'
const rsNonAstral = '[^' + rsAstralRange + ']'
const rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}'
const rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]'
const rsZWJ = '\\u200d'

// Used to compose unicode regexes
const reOptMod = rsModifier + '?'
const rsOptVar = '[' + rsVarRange + ']?'
const rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*'
const rsSeq = rsOptVar + reOptMod + rsOptJoin
const rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')'

// Used to match string symbols
const reComplexSymbol = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g')

// Used to detect strings with complex Unicode characters
const reHasComplexSymbol = RegExp('[' + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']')

/**
 * Converts a string to an array of Unicode characters.
 *
 * @param { string } string - The string to convert
 * @returns { string[] } Returns the converted array of characters
 */
function stringToArray(string: string): string[] {
  return string.match(reComplexSymbol) || []
}

// Used for built-in method references
const objectProto = Object.prototype

// Used to resolve the [`toStringTag`] of values.
const objectToString = objectProto.toString

// Built-in value references
const GlobalSymbol = typeof global !== 'undefined' ? global.Symbol : 
               typeof window !== 'undefined' ? window.Symbol : Symbol

// Used to convert symbols to primitives and strings
const symbolProto = GlobalSymbol ? GlobalSymbol.prototype : undefined
const symbolToString = symbolProto?.toString

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @param { unknown } value - The value to check
 * @returns { boolean } Returns `true` if `value` is object-like, else `false`
 */
function isObjectLike(value: unknown): boolean {
  return !!value && typeof value === 'object'
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @param { unknown } value - The value to check
 * @returns { boolean } Returns `true` if `value` is correctly classified, else `false`
 */
function isSymbol(value: unknown): boolean {
  return typeof value === 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) === symbolTag)
}

/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` and `undefined` values. The sign of `-0` is preserved.
 *
 * @param { unknown } value - The value to process
 * @returns { string } Returns the string
 */
function toString(value: unknown): string {
  // Exit early for strings to avoid a performance hit in some environments
  if(typeof value === 'string') return value
  if(value == null) return ''

  if(isSymbol(value)) return symbolToString ? symbolToString.call(value) : ''
  const result = (value + '')

  // Only perform the division operation if value is actually a number
  return (result === '0' && typeof value === 'number' && (1 / value) === -INFINITY) ? '-0' : result
}

/**
 * Creates a function like `upperFirst`.
 *
 * @param { string } methodName - The name of the `String` case method to use
 * @returns { (string: string) => string } Returns the new case function
 */
function createCaseFirst(methodName: 'toUpperCase' | 'toLowerCase'): (string: string) => string {
  return function(string: string): string {
    string = toString(string)

    const strSymbols = reHasComplexSymbol.test(string) ? stringToArray(string) : undefined
    const chr = strSymbols ? strSymbols[0] : string.charAt(0)
    const trailing = strSymbols ? strSymbols.slice(1).join('') : string.slice(1)

    return chr[methodName]() + trailing
  }
}

/**
 * Converts the first character of `string` to upper case.
 *
 * @param { string } [string=''] - The string to convert
 * 
 * @returns { string } Returns the converted string
 * @throws { TypeError } Throws if the input cannot be converted to a string
 */
function upperFirst(string: string = ''): string {
  try {
    return createCaseFirst('toUpperCase')(string)
  } catch (error) {
    throw new TypeError('Input cannot be converted to a string')
  }
}


export default upperFirst