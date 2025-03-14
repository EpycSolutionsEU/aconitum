/**
 * Checks if a process with the given process ID is running
 *
 * This function attempts to send a signal 0 to the process, which doesn't actually
 * send a signal but checks if the process exists and if the current process has
 * permission to send signals to it.
 *
 * @param pid - The process ID to check
 * @returns `true` if the process is running, `false` otherwise
 *
 * @example
 * ```ts
 * import { isRunning } from './is-running'
 * 
 * // Check if process with ID 1234 is running
 * if (isRunning(1234)) {
 *   console.log('Process is running')
 * } else {
 *   console.log('Process is not running')
 * }
 * ```
 */
function isRunning(pid: number): boolean {
  if (isRunning.stub !== isRunning) {
    return isRunning.stub.apply(this, arguments as unknown as [number])
  }
  
  try {
    return process.kill(pid, 0)
  } catch (e) {
    // If the error code is EPERM, the process exists but we don't have permission to send signals to it
    // This still means the process is running
    return (e as NodeJS.ErrnoException).code === 'EPERM'
  }
}

// Maintain the stub functionality for testing/mocking
isRunning.stub = isRunning

export default isRunning