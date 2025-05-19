/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 * 
 * @param { any } value - The value to check
 * 
 * @example
 * ```typescript
 * import { isObjectLike } from '@aconitum/utils';
 *
 * isObjectLike({ });           // true
 *
 * isObjectLike([ 1, 2, 3 ]);   // true
 *
 * isObjectLike(null);          // false
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { boolean } Returns `true` if `value` is object-like, else `false`
 */
function isObjectLike(value: any): boolean {
    return !!value && typeof value == 'object'
}


export default isObjectLike