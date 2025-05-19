/**
 * Escapes the `RegExp` special characters "^", "$", "\\", ".", "*", "+",
 * "?", "(", ")", "[", "]", "{", "}", and "|" in a string.
 * 
 * Regular expressions use special characters to define pattern matching rules.
 * When you want to match these characters literally in a string pattern, they
 * need to be escaped with a backslash. This function handles that escaping
 * process automatically.
 * 
 * Common use cases include:
 * - Creating RegExp objects from user input
 * - Building dynamic regular expressions safely
 * - Ensuring literal string matching in RegExp patterns
 * - Preventing RegExp injection vulnerabilities
 * 
 * @param { string } [string=''] - The string to escape.
 * 
 * @example
 * ```typescript
 * import escapeRegExp from '@aconitum/utils';
 * 
 * // Escape special characters in a string
 * escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\\.com/\)'
 * 
 * // Create a safe RegExp from user input
 * const userInput = 'hello.world';
 * const safeRegExp = new RegExp(escapeRegExp(userInput));
 * // => /hello\.world/
 * 
 * // Match literal special characters
 * const text = 'How much for the C++ book?';
 * const pattern = new RegExp(escapeRegExp('C++'));
 * text.match(pattern);
 * // => ['C++']
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { string } Returns the escaped string.
 * @throws { TypeError } Throws if the input is not a string or cannot be converted to a string.
 */

// Used as references for various `Number` constants
const INFINITY = 1 / 0

// `Object#toString` result references
const symbolTag = '[object Symbol]'

// Used to match `RegExp` syntax characters
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g
const reHasRegExpChar = RegExp(reRegExpChar.source)

// Used for built-in method references
const objectProto = Object.prototype

/**
 * Used to resolve the [`toStringTag`] of values.
 */
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
 * @param { unknown } value - The value to check.
 * @returns { boolean } Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value: unknown): boolean {
  return !!value && typeof value === 'object'
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @param { unknown } value - The value to check.
 * @returns { boolean } Returns `true` if `value` is correctly classified, else `false`.
 */
function isSymbol(value: unknown): boolean {
  return typeof value === 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) === symbolTag)
}

/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` and `undefined` values. The sign of `-0` is preserved.
 *
 * @param { unknown } value - The value to process.
 * @returns { string } Returns the string.
 */
function toString(value: unknown): string {
  // Exit early for strings to avoid a performance hit in some environments.
  if(typeof value === 'string') return value
  if(value == null) return ''

  if(isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : ''
  }
  const result = (value + '')

  // Only perform the division operation if value is actually a number
  return (result === '0' && typeof value === 'number' && (1 / value) === -INFINITY) ? '-0' : result
}

/**
 * Escapes the `RegExp` special characters "^", "$", "\\", ".", "*", "+",
 * "?", "(", ")", "[", "]", "{", "}", and "|" in a string.
 *
 * @param { string } [string=''] - The string to escape.
 * @returns { string } Returns the escaped string.
 * @throws { TypeError } Throws if the input cannot be converted to a string.
 */
function escapeRegExp(string: string = ''): string {
  try {
    string = toString(string)

    return (string && reHasRegExpChar.test(string))
      ? string.replace(reRegExpChar, '\\$&')
      : string
  } catch(error) {
    throw new TypeError('Input cannot be converted to a string')
  }
}

export default escapeRegExp