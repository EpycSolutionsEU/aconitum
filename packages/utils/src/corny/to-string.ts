import { isSymbol } from '../is/index.js'

/** Used as references for various `Number` constants. */
let INFINITY = 1 / 0

/** Built-in value references. */
let Symbol = global.Symbol

/** Used to convert symbols to primitives and strings. */
let symbolProto = Symbol ? Symbol.prototype : undefined
let symbolToString = symbolProto ? symbolProto.toString : undefined


/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` or `undefined` values. The sign of `-0` is preserved
 * 
 * @param { any } value - The value to process
 * 
 * @example
 * ```typescript
 * toString(null); 
 * // => ""
 * 
 * toString(-0);
 * // => "-0"
 *
 * toString([1, 2, 3]);
 * // => "1,2,3"
 * ```
 *
 * @since Introduced in v0.2.0
 * @returns { string } Returns the converted string
 */
function toString(value: any): string {
    // Exit early for strings to avoid a performance hit in some environments
    if(typeof value == 'string') return value
    if(value == null) return ''

    if(isSymbol(value)) return symbolToString ? symbolToString.call(value) : ''

    let result = (value + '')
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result
}

export default toString