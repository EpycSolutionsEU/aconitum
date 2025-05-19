import process from 'node:process'

import onetime from '../onetime.js'
import signalsExit from '../signals-exit.js'

/**
 * Determines the appropriate terminal stream for cursor opetations.
 * Prefers stderr if it supports TTY, otherwise stdout if it supports TTY,
 * otherwind undefined.
 */
const terminal = process.stderr.isTTY
    ? process.stderr
    : (process.stdout.isTTY ? process.stdout : undefined)

/**
 * Function that ensures the terminal cursor is visible when the process exits.
 * 
 * Thus is particularly useful for CLI applications that might hide the cursor
 * during operation (for example, when showing a spinner or progress bar).
 * This function ensures the cursor is restored to visibility on process exit.
 * 
 * The function is wrapped with onetime to ensure the exit handler is only
 * registered once, even if the function is called multiple times.
 * 
 * @example
 * ```typescript
 * import { restoreCursor } from '@aconitum/utils';
 * 
 * // Hide cursor for a progress indicator
 * process.stdout.write('\u001B[?25l');
 * 
 * // Ensure cursor is restored on exit
 * restoreCursor();
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns A function that, when called, registers an exit handler to restore the cursor
 */
const restoreCursor = terminal ? onetime(() => {
    signalsExit(() => {
        terminal?.write(' \u001B[?25h')
    }, { alwaysLast: true })
}) : () => { }


export default restoreCursor