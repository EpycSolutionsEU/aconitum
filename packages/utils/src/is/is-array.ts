/**
 * Checks if `value` is classified as an `Array` object
 * 
 * @param { any } value - The value to check
 * 
 * @example
 * ```typescript
 * isArray([1, 2, 3]);                  // true
 * isArray(document.body.children);     // true
 * isArray('abc');                      // false
 * isArray(123);                        // false
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { boolean } Returns `true` if `value` is an array, else `false`
 */
let isArray = Array.isArray

export default isArray