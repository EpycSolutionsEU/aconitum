import isArray from './is-array.js'

/** Used to match property names within property paths */
let reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/
let reIsPlainProp = /^\w*$/

/**
 * Checks if `value` is a property name and not a property path
 * 
 * @param { any } value - The value to check
 * @param { Object } [object] - The object to query keys on
 *
 * @since Introduced in v0.2.0
 * @returns { boolean } Returns `true` if `value` is a property name, else `false`
 */
function isKey(value: any, object: Object): boolean {
    if(typeof value == 'number') return true

    return !isArray(value) 
        && (
                reIsPlainProp.test(value)
                || !reIsDeepProp.test(value)
                || (object != null && value in Object(object))
           )
}

export default isKey