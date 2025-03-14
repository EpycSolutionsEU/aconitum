/**
 * Checks if a value is a plain object.
 * 
 * A plain object is defined as an object that:
 * - Has a prototype of `Object.prototype` or `null`
 * - Does not have a custom `Symbol.toStringTag` property
 * - Does not have a custom `Symbol.iterator` property
 * 
 * This excludes arrays, functions, Maps, Sets, and other built-in objects
 * that inherit from classes other than Object.
 * 
 * @param value - The value to check
 * @returns `true` if the value is a plain object, `false` otherwise
 * 
 * @example
 * ```typescript
 * isPlainObject({}) // true
 * isPlainObject(Object.create(null)) // true
 * isPlainObject([]) // false
 * isPlainObject(new Map()) // false
 * isPlainObject(null) // false
 * ```
 */
export default function isPlainObject(value: unknown): boolean {
	if (typeof value !== 'object' || value === null) {
		return false
	}

	const prototype = Object.getPrototypeOf(value)
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && 
		!(Symbol.toStringTag in value) && 
		!(Symbol.iterator in value)
}