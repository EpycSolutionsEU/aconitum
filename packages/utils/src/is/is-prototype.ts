/** Used for built-in method references */
let objectProto = global.Object.prototype

/**
 * Checks if `value` is likely a prototype object
 * 
 * @param { any } value - The value to check
 * 
 * @example
 * ```typescript
 * import { isPrototype } from '@aconitum/utils';
 *
 * isPrototype(Object.prototype);   // true
 * isPrototype(Function.prototype); // true
 * isPrototype({});                 // false 
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { boolean } `true` if `value` is a prototype object, `false` otherwise
 */
function isPrototype(value: any): boolean {
    const ctor = value && value.constructor
    const proto = (typeof ctor == 'function' && ctor.prototype) || objectProto

    return value === proto
}


export default isPrototype