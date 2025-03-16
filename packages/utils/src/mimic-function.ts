/**
 * Options for the mimicFunction utility.
 */
interface MimicFunctionOptions {
    /**
     * When true, non-configurable properties will be ignored instead of throwing an error.
     * @default false
     */
    ignoreNonConfigurable?: boolean;
}

/**
 * Copies a property from one function to another if possible.
 * 
 * @param to - The target function to copy properties to
 * @param from - The source function to copy properties from
 * @param property - The property name to copy
 * @param ignoreNonConfigurable - Whether to ignore non-configurable properties
 * @returns void
 */
const copyProperty = (to: Function, from: Function, property: string | symbol, ignoreNonConfigurable: boolean): void => {
    // `Function#length` should reflect the parameters of `to` not `from` since we keep its body.
    // `Function#prototype` is non-writable and non-configurable so can never be modified.
    if (property === 'length' || property === 'prototype') {
        return;
    }

    // `Function#arguments` and `Function#caller` should not be copied. They were reported to be present in `Reflect.ownKeys` for some devices in React Native (#41), so we explicitly ignore them here.
    if (property === 'arguments' || property === 'caller') {
        return;
    }

    const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
    const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);

    if (!fromDescriptor) {
        return;
    }

    if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
        return;
    }

    Object.defineProperty(to, property, fromDescriptor);
};

/**
 * Checks if a property can be copied from one function to another.
 * 
 * `Object.defineProperty()` throws if the property exists, is not configurable and either:
 * - one its descriptors is changed
 * - it is non-writable and its value is changed
 * 
 * @param toDescriptor - The property descriptor of the target function
 * @param fromDescriptor - The property descriptor of the source function
 * @returns Whether the property can be copied
 */
const canCopyProperty = function (
    toDescriptor: PropertyDescriptor | undefined,
    fromDescriptor: PropertyDescriptor
): boolean {
    return toDescriptor === undefined || toDescriptor.configurable || (
        toDescriptor.writable === fromDescriptor.writable &&
        toDescriptor.enumerable === fromDescriptor.enumerable &&
        toDescriptor.configurable === fromDescriptor.configurable &&
        (toDescriptor.writable || toDescriptor.value === fromDescriptor.value)
    );
};

/**
 * Changes the prototype of the target function to match the source function.
 * 
 * @param to - The target function
 * @param from - The source function
 * @returns void
 */
const changePrototype = (to: Function, from: Function): void => {
    const fromPrototype = Object.getPrototypeOf(from);
    if (fromPrototype === Object.getPrototypeOf(to)) {
        return;
    }

    Object.setPrototypeOf(to, fromPrototype);
};

/**
 * Creates a wrapped toString function with the name of the original function.
 * 
 * @param withName - The name to include in the toString output
 * @param fromBody - The body of the original function's toString
 * @returns The wrapped toString output
 */
const wrappedToString = (withName: string, fromBody: string): string => `/* Wrapped ${withName}*/\n${fromBody}`;

const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');
const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, 'name');

/**
 * Changes the toString method of the target function to reflect it's a wrapped version of the source function.
 * 
 * We call `from.toString()` early (not lazily) to ensure `from` can be garbage collected.
 * We use `bind()` instead of a closure for the same reason.
 * Calling `from.toString()` early also allows caching it in case `to.toString()` is called several times.
 * 
 * @param to - The target function
 * @param from - The source function
 * @param name - The name of the target function
 * @returns void
 */
const changeToString = (to: Function, from: Function, name: string): void => {
    const withName = name === '' ? '' : `with ${name.trim()}() `;
    const newToString = wrappedToString.bind(null, withName, from.toString());
    // Ensure `to.toString.toString` is non-enumerable and has the same `same`
    if (toStringName) {
        Object.defineProperty(newToString, 'name', toStringName);
    }
    if (toStringDescriptor) {
        const { writable, enumerable, configurable } = toStringDescriptor; // We destructure to avoid a potential `get` descriptor.
        Object.defineProperty(to, 'toString', {
            value: newToString,
            writable,
            enumerable,
            configurable,
        });
    }
};

/**
 * Copies properties, prototype, and toString method from one function to another.
 * 
 * This is useful for creating wrapper functions that maintain the same interface as the original.
 * 
 * @param to - The target function to copy properties to
 * @param from - The source function to copy properties from
 * @param options - Options for controlling the mimic behavior
 * @returns The modified target function
 * 
 * @example
 * ```typescript
 * function original() {
 *   return 'original';
 * }
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
 */
export default function mimicFunction<T extends Function>(
    to: T,
    from: Function,
    { ignoreNonConfigurable = false }: MimicFunctionOptions = {}
): T {
    const { name } = to;

    for (const property of Reflect.ownKeys(from)) {
        copyProperty(to, from, property, ignoreNonConfigurable);
    }

    changePrototype(to, from);
    changeToString(to, from, name);

    return to;
}