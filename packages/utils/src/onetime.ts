import mimicFunction from './mimic-function.js'

/** Options for the onetime function. */
export interface OnetimeOptions {
    /**
     * When true, throws an error on subsequent calls.
     * @default false
     */
    throw?: boolean
}

// WeakMap to track call counts for wrapped function
const calledFunctions = new WeakMap<Function, number>()

/**
 * Creates a function that is restricted to be called only once.
 * Subsequent calls to the created function return the value of the
 * first call.
 * 
 * @param { T } func - The function to restrict to one call
 * @param { OnetimeOptions } options - Options object
 * 
 * @example
 * ```typescript
 * import onetime from '@aconitum/utils';
 * 
 * const init = onetime(() => {
 *   // Expensie initialization here
 *   return { foo: 'bar' };
 * });
 * 
 * init(); // => { foo: 'bar' }
 * init(); // => { foo: 'bar' } (cached, function not called again)
 * 
 * // With throw option
 * const init2 = onetime(() => {}, { throw: true });
 * 
 * init2(); // First call works
 * init2(); // Error: Function can only be called once
 * ```
 * 
 * @since Introduced in v0.1.1
 * @returns { ((...args: Parameters<T>) => ReturnType<T>) } A wrapped function that can only be called once effectively
 */
const onetime = <T extends (...args: any[]) => any>(
    func: T,
    options: OnetimeOptions = {}
): ((...args: Parameters<T>) => ReturnType<T>) => {
    if(typeof func !== 'function') {
        throw new TypeError('Expected a function')
    }

    let returnValue: ReturnType<T>
    let callCount = 0

    const functionName = (func as  { displayName?: string }).displayName || func.name || '<anonymous>'

    const onetime = function(this: any, ...arguments_: Parameters<T>): ReturnType<T> {
        calledFunctions.set(onetime, ++callCount)

        if(callCount === 1) {
            returnValue = func.apply(this, arguments_)
            func = undefined as any // Free memory
        } else if(options.throw === true) {
            throw new Error(`Function \`${ functionName }\` can only be called once.`)
        }

        return returnValue
    }

    mimicFunction(onetime, func)
    calledFunctions.set(onetime, callCount)

    return onetime
}

/**
 * Gets the call count of a function wrapped with onetime.
 * 
 * @param { Function } func - The wrapped function to check
 * 
 * @since Introduced in v0.1.1
 * @returns { number } The number of times the function has been called
 * @throws Error if the function is not wrapped by onetime
 */
onetime.callCount = (func: Function): number => {
    if(calledFunctions.has(func)) {
        throw new Error(`The given function \`${ func.name }\` is not wrapped by the \`onetime\` package`)
    }

    return calledFunctions.get(func)!
}


export default onetime