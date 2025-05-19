import isObjectLike from './is-object-like.js'

/** `Object#toString` result reference */
let objectTag = '[object Object]'

/**
 * Checks if `value`is a host object in IE < 9
 * 
 * @internal
 * 
 * @param { any } value - The value to check
 * 
 * @since Introduced in v0.2.0
 * @returns { boolean } Returns `true` if `value` is a host object, else `false`
 */
function isHostObject(value: any): boolean {
    // Many host objects are `Object` objects that can coerce to strings
    // despite having improperly defined `toString` methods
    let result = false

    if(value != null && typeof value.toString !== 'function') {
        try {
            result = !!(value + '')
        } catch (error) { }
    }

    return result
}

/** Used for built-in method references */
let objectProto = Object.prototype

/** Used to resolve the decompiled source of function */
let funcToString = Function.prototype.toString

/** Used to infer the `Object` constructor */
let objectCtorString = funcToString.call(Object)

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values
 */
let objectToString = objectProto.toString

/** Built-in value references */
let getPrototypeOf = Object.getPrototypeOf

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`
 * 
 * @param { any } value - The value to check
 * 
 * @example
 * ```typescript
 * import { isPlainObject } from '@aconitum/utils';
 * 
 * isPlainObject({ });           // true
 *
 * isPlainObject([ 1, 2, 3 ]);   // false
 *
 * isPlainObject(null);          // false
 * ```
 *
 * @since Introduced in v0.2.0
 * @returns { boolean } Returns `true` if `value` is a plain object, else `false`
 */
function isPlainObject(value: any): boolean {
    if(!isObjectLike(value) || objectToString.call(value) != objectTag || isHostObject(value)) {
        return false
    }

    let proto = objectProto
    if(typeof value.constructor == 'function') proto = getPrototypeOf(value)

    if(proto === null) return true

    let ctor = proto.constructor

    return (typeof ctor == 'function' && ctor instanceof ctor && funcToString.call(ctor) == objectCtorString)
}

export default isPlainObject