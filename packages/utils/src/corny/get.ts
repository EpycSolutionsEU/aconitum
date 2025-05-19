import { isArray, isKey } from '../is/index.js'
import toString from './to-string.js'

/** Used as references for various `Number` constants */
let INFINITY = 1 / 0

/** `Object#toString` result reference */
let symbolTag = '[object Symbol]'

/** Used to match property names within property paths */
let reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/
let reIsPlainProp = /^\w*$/
let rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g

/** Used to match backslashes in property name */
let reEscapeChar = /\\(\\)?/g

/** Used for built-in method references */
let objectProto = global.Object.prototype

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values
 */
let objectToString = objectProto.toString

/** Built-in value references */
let Symbol = global.Symbol

/** Used to convert symbols to primitives and strings */
let symbolProto = Symbol ? Symbol.prototype : undefined
let symbolToString = symbolProto ? symbolProto.toString : undefined

/**
 * The base implementation of `get` without support for default values
 * 
 * @param { Object } object - The object to query
 * @param { Array<string> | string } path - The path of the property to get
 * 
 * @private
 * @returns { any } Returns the resolved value
 */
function baseGet(object: Object, path: Array<string> | string): any {
    path = isKey(path, object) ? [path + ''] : baseToPath(path)

    let index = 0
    let length = path.length

    while(object != null && index < length) {
        object = (object as { [key: string]: any })[path[index++]]
    }

    return (index && index == length) ? object : undefined
}

/**
 * The base implementation of `toPath` which only converts `value` to a
 * path if it's not one
 * 
 * @param { any } value - The value to process
 * 
 * @private
 * @returns { Array<string> } Returns the property path array
 */
function baseToPath(value: any): Array<string> {
    return isArray(value) ? value : stringToPath(value)
}

/**
 * Converts `string` to a property path array
 * 
 * @param { string } string - The string to convert
 * 
 * @returns { Array<string> } Returns the property path array
 */
function stringToPath(string: string): Array<string> {
    let result: string[] = []

    toString(string).replace(rePropName, (match: string, number: string, quote: string, subString: string): string => {
        result.push(quote? subString.replace(reEscapeChar, '$1') : (number || match))
        return match
    })

    return result
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @param { Object } object - The object to query
 * @param { Array | string } path - The path of the property to get
 * @param { any } [defaultValue] - The value returned for `undefined` resolved values
 *
 * @example
 * ```typescript
 * let object = { "a": [{ "b": { "c": 3 } }] };
 * 
 * get(object, "a[0].b.c");
 * // => 3
 *
 * get(object, ["a", "0", "b", "c"]);
 * // => 3
 *
 * get(object, "a.b.c", "default");
 * // => "default"
 * ```
 *
 * @since Introduced in v0.2.0
 * @returns { any } Returns the resolved value
 */
function get(object: Object, path: Array<string> | string, defaultValue?: any): any {
    let result = object == null ? undefined : baseGet(object, path)
    return result === undefined ? defaultValue : result
}

export default get