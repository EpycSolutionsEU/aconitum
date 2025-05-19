/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 * 
 * @param { any } value - The value to check
 * 
 * @example
 * ```typescript
 * import { isObject } from '@aconitum/utils';
 * 
 * isObject({ });           // true
 * 
 * isObject([ 1, 2, 3 ]);   // true
 * 
 * isObject(null);          // false
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { boolean } Returns `true` if `value` is an object, else `false`
 */
function isObject(value: any): boolean {
    let type = typeof value
    return !!value && (type == 'object' || type == 'function')
}

export default isObject