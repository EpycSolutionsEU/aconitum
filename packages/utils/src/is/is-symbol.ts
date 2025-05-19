import isObjectLike from "./is-object-like.js"

/**
 * Check if `value` is classified as a `Symbol` primitive or object
 * 
 * @param { any } value - The value to check
 * 
 * @example
 * ```typescript
 * isSymbol(Symbol.iterator);
 * // => true
 * 
 * isSymbol('abc');
 * // => false
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { boolean } Returns `true` if `value` is a symbol, else `false`
 */
function isSymbol(value: any): boolean {
    const type = typeof value
    return typeof value == 'symbol' || (isObjectLike(value) && global.Object.prototype.toString() == '[object Symbol]')
}

export default isSymbol