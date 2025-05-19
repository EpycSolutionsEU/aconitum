/**
 * Checks if a process with the given process ID is running.
 * 
 * This function attempts to send a signal 0 to the process, which
 * doesn't actually send a signal but checks if the process exists and
 * if the current process has permission to send signals to it.
 *
 * @param { number } pid - The process ID to check
 *
 * @example
 * ```typescript
 * import { isRunning } from '@aconitum/utils';
 *
 * // Check if process with ID 1234 is running.
 * if(isRunning(1234)) {
 *   console.log('Process with ID 1234 is running.');
 * } else {
 *   console.log('Process with ID 1234 is not running.');
 * }
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { boolean } `true` if the process is running, `false` otherwise
 */
function isRunning(pid: number): boolean {
    if(isRunning.stub !== isRunning) {
        return isRunning.stub(pid)
    }

    try {
        return process.kill(pid, 0)
    } catch (error) {
        // If the error code is EPERM, the process exists but we don't
        // have permission to send signals to it.
        // This still means the process is running.
        return (error as NodeJS.ErrnoException).code === 'EPERM'
    }
}

// Maintain the stub functionality for testing/mocking
isRunning.stub = isRunning


export default isRunning