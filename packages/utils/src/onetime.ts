import mimicFunction from './mimic-function';

/**
 * Options for the onetime function.
 */
export interface OnetimeOptions {
  /**
   * When true, throws an error on subsequent calls.
   * @default false
   */
  throw?: boolean;
}

// WeakMap to track call counts for wrapped functions
const calledFunctions = new WeakMap<Function, number>();

/**
 * Creates a function that is restricted to be called only once.
 * Subsequent calls to the created function return the value of the first call.
 * 
 * @param function_ - The function to restrict to one call
 * @param options - Options object
 * @returns A wrapped function that can only be called once effectively
 * 
 * @example
 * ```typescript
 * import onetime from './onetime';
 * 
 * const init = onetime(() => {
 *   // Expensive initialization here
 *   return {foo: 'bar'};
 * });
 * 
 * init(); // => {foo: 'bar'}
 * init(); // => {foo: 'bar'} (cached, function not called again)
 * 
 * // With throw option
 * const init2 = onetime(() => {}, {throw: true});
 * init2(); // First call works
 * init2(); // Error: Function can only be called once
 * ```
 */
const onetime = <T extends (...args: any[]) => any>(
  function_: T,
  options: OnetimeOptions = {}
): ((...args: Parameters<T>) => ReturnType<T>) => {
  if (typeof function_ !== 'function') {
    throw new TypeError('Expected a function');
  }

  let returnValue: ReturnType<T>;
  let callCount = 0;
  const functionName = (function_ as { displayName?: string }).displayName || function_.name || '<anonymous>';

  const onetime = function (this: any, ...arguments_: Parameters<T>): ReturnType<T> {
    calledFunctions.set(onetime, ++callCount);

    if (callCount === 1) {
      returnValue = function_.apply(this, arguments_);
      function_ = undefined as any; // Free memory
    } else if (options.throw === true) {
      throw new Error(`Function \`${functionName}\` can only be called once`);
    }

    return returnValue;
  };

  mimicFunction(onetime, function_);
  calledFunctions.set(onetime, callCount);

  return onetime;
};

/**
 * Gets the call count of a function wrapped with onetime.
 * 
 * @param function_ - The wrapped function to check
 * @returns The number of times the function has been called
 * @throws Error if the function is not wrapped by onetime
 */
onetime.callCount = (function_: Function): number => {
  if (!calledFunctions.has(function_)) {
    throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
  }

  return calledFunctions.get(function_)!;
};

export default onetime;