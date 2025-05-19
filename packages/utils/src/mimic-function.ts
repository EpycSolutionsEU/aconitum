/** Options for the mimicFunction utility. */
interface MimicFunctionOptions {
    /**
     * When true, non-configurable properties will be ignored instead
     * of throwing an error.
     * @default false
     */
    ignoreNonConfigurable?: boolean
}

/**
 * Copies a property from one function to another if possible.
 * 
 * @param { Function } to - The target function to copy properties to
 * @param { Function } from - The source function to copy properties from
 * @param { string | symbol } property - The property name to copy
 * @param { boolean } ignoreNonConfigurable - Whether to ignore non-configurable properties
 */
const copyProperty = (
    to: Function, from: Function, 
    property: string | symbol, ignoreNonConfigurable: boolean
): void => {
    // `Function#length` should reflect the parameters of `to` not `from` since we keep its body.
    // `Function#prototype` is non-writable and non-configurable so can never be modified.
    if(property === 'length' || property === 'prototype') return

    // `Function#arguments` and `Function#caller` should not be copied. They were reported to be present 
    // in `Reflect.ownKeys` for some devices in React Native (#41), so we explicitly ignore them here.
    if(property === 'arguments' || property === 'caller') return

    const toDescriptor = Object.getOwnPropertyDescriptor(to, property)
    const fromDescriptor = Object.getOwnPropertyDescriptor(from, property)

    if(!fromDescriptor) return
    if(!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) return

    Object.defineProperty(to, property, fromDescriptor)
}

/**
 * Checks if a property can be copied from one function to another.
 * 
 * `Object.defineProperty()` throws if the property exists, is not
 * configurable and either:
 * - one its descriptors is changed
 * - it is non-writable and its value is changed
 * 
 * @param { PropertyDescriptor | undefined } toDescriptor - The property descriptor of the target function
 * @param { PropertyDescriptor } fromDescriptor - The property descriptor of the target function
 * 
 * @returns { boolean } Whether the property can be copied
 */
function canCopyProperty(
    toDescriptor: PropertyDescriptor | undefined,
    fromDescriptor: PropertyDescriptor
): boolean {
    return toDescriptor === undefined
        || toDescriptor.configurable
        || (
                toDescriptor.writable === fromDescriptor.writable &&
                toDescriptor.enumerable === fromDescriptor.enumerable &&
                toDescriptor.configurable === fromDescriptor.configurable &&
                (toDescriptor.writable || toDescriptor.value === fromDescriptor.value)
           )
}

/**
 * Changes the prototype of the target function to match
 * the source function.
 * 
 * @param { Function } to - The target function
 * @param { Function } from - The source function
 */
const changePrototype = (to: Function, from: Function): void => {
    const fromPrototype = Object.getPrototypeOf(from)
    if(fromPrototype === Object.getPrototypeOf(to)) return

    Object.setPrototypeOf(to, fromPrototype)
}

/**
 * Creates a wrapped toString function with the name of the original
 * function.
 * 
 * @param { string } withName - The name to include in the toString output
 * @param { string } fromBody - The body of the original function's toString
 * 
 * @returns { string } The wrapped toString output
 */
const wrappedToString = (withName: string, fromBody: string): string => 
    `/* Wrapped ${ withName } */\n${ fromBody }`


const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, 'toString')
const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, 'name')


/**
 * Changes the toString method of the target function to reflect it's a
 * wrapped version of the source function.
 * 
 * We call `from.toString()` early (not lazily) to ensure `from` can be
 * garbage collected.
 * We use `bind()` instead of a closure for the same reason.
 * Calling `from.toString()` early also allows caching it in case `to.toString()`
 * is called several times.
 * 
 * @param { Function } to - The target function
 * @param { Function } from - The source function
 * @param { string } name - The name of the target function
 */
const changeToString = (to: Function, from: Function, name: string): void => {
    const withName = name === '' ? '' : `with ${ name.trim() }() `
    const newToString = wrappedToString.bind(null, withName, from.toString())

    // Ensure `to.toString.toString` is non-enumerable and has the same `same`
    if(toStringName) Object.defineProperty(newToString, 'name', toStringName)

    if(toStringDescriptor) {
        // We destructure to avoid a potential `get` descriptor.
        const { writable, enumerable, configurable } = toStringDescriptor

        Object.defineProperty(to, 'toString', {
            value: newToString,
            writable,
            enumerable,
            configurable
        })
    }
}

/**
 * Copies properties, prototype, and toString method from one function
 * to another.
 * 
 * This is useful for creating wrapper functions that maintain the same
 * interface as the original.
 * 
 * @param { T } to - The target function to copy properties to
 * @param { Function } from - The source function to copy properties from
 * @param { MimicFunctionOptions } options - Options for controlling the mimic behaviour
 * 
 * @example
 * ```typescript
 * function original() {
 *   return 'original';
 * }
 * 
 * original.customProperty = 'value';
 * 
 * function wrapper() {
 *   // Do something before
 *   const result = original();
 *   // Do something after
 *   return result;
 * }
 * 
 * // Copy properties, prototype, and toString from original to wrapper
 * mimicFunction(wrapper, original);
 * 
 * console.log(wrapper.customProperty); // 'value'
 * ```
 * 
 * @example Memoization with property preservation
 * ```typescript
 * function expensiveCalculation(n: number) {
 *   console.log('Computing...');
 *   return n * 2;
 * }
 * 
 * expensiveCalculation.timeComplexity = '0(1)';
 * 
 * // Create a memoized version
 * const memoized = function(n: number) {
 *   const cache: Record<number, number> = {};
 * 
 *   return function(this: any, n: number) {
 *     if(n in cache) return cache[n];
 * 
 *     const result = expensiveCalculation.call(this, n);
 *     cache[n] = result;
 *   }
 * }()
 * 
 * // Preserve the original function's properties
 * mimicFunction(memoized, expensiveCalculation);
 * 
 * console.log(memoized, expensiveCalculation); // '0(1)'
 * memoized(5); // Logs: 'Computing...' and returns 10
 * memoized(5); // Returns 10 without computing again
 * ```
 * 
 * @example Working with class methods
 * ```typescript
 * class API {
 *   baseUrl = 'https://api.example.com';
 * 
 *   async fetchData(endpoint: string) {
 *     return fetch(`${ this.baseUrl }/${ endpoint }`).then((response) => response.json());
 *   }
 * }
 * 
 * const api = new API()
 * 
 * // Create a wrapped ersion with logging
 * function wrappedFetch(endpoint: string) {
 *   console.log(`Fetching from ${ endpoint }...`);
 * 
 *   return api.fetchData.call(api, endpoint)
 *     .then((data) => {
 *       console.log(`Received data from ${ endpoint }.`);
 *       return data;
 *     });
 * }
 * 
 * // Preserve the original method's properties
 * mimicFunction(wrappedFetch, api.fetchData);
 * 
 * // Now wrappedFetch can be used as a drop-in replacement
 * ```
 * 
 * @example Using the ignoreNonConfigurable option
 * ```typescript
 * const originalFn = function() {};
 * 
 * // Create a non-configurable property
 * Object.defineProperty(originalFn, 'version', {
 *   value: '1.0.0',
 *   configurable: false
 * });
 * 
 * const wrappedFn = function() {};
 * 
 * // This would throw an error without the option
 * mimicFunction(wrappedFn, originalFn, { ignoreNonConfigurable: true });
 * 
 * // The non-configurable property was ignored
 * console.log(wrappedFn.version); // undefined
 * ```
 * 
 * @since Introduced in v0.1.1
 * @returns { T } The modified target function
 */
function mimicFunction<T extends Function>(
    to: T,
    from: Function,
    { ignoreNonConfigurable = false }: MimicFunctionOptions = {}
): T {
    const { name } = to

    for(const property of Reflect.ownKeys(from)) {
        copyProperty(to, from, property, ignoreNonConfigurable)
    }

    changePrototype(to, from)
    changeToString(to, from, name)

    return to
}

export default mimicFunction