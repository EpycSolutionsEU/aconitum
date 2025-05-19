/** Interface for delay function parameters. */
interface DelayOptions {
    /** Number of seconds to delay */
    seconds?: number

    /** Number of milliseconds to delay */
    milliseconds?: number
}

/**
 * Creates a promise that resolves after a specified delay.
 * 
 * @param { DelayOptions } options - The delay options object
 * 
 * @example
 * ```typescript
 * import { delay } from '@acomitum/utils';
 * 
 * // Delay for 2 seconds
 * await delay({ seconds: 2 });
 * 
 * // Delay for 500 milliseconds
 * await delay({ milliseconds: 500 });
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { Promise<void> } A promise that resolves after the specified delay
 * @throws { TypeError } If neither seconds nor milliseconds is provided
 */
async function delay({ seconds, milliseconds }: DelayOptions): Promise<void> {
    let duration: number

    if(typeof seconds === 'number') duration = seconds * 1000
    else if(typeof milliseconds === 'number') duration = milliseconds
    else throw new TypeError('Expected an object with either `seconds` or `milliseconds`.')

    return new Promise((resolve) => {
        setTimeout(resolve, duration)
    })
}

export default delay