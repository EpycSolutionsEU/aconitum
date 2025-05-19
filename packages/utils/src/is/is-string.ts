import isArray from './is-array.js'
import isObjectLike from './is-object-like.js'

/**
 * Checks if a value is classified as a string primitive or String object.
 * 
 * @param value - The value to check
 * 
 * @example
 * ```typescript
 * import { isString } from '@aconitum/utils';
 * 
 * isString('abc');        // true
 * isString(new String('abc')); // true
 * isString(1);           // false
 * isString(true);        // false
 * isString(null);        // false
 * isString(undefined);   // false
 * isString([]);          // false
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { boolean } `true` if the value is a string, `false` otherwise
 */
function isString(value: unknown): boolean {
    return typeof value === 'string' || (!isArray(value) && isObjectLike(value) && Object.prototype.toString() == '[object String]')
}


export default isString