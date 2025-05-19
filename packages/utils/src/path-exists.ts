import fs, { promises as fsPromises } from 'node:fs'

/**
 * Asynchronously checks if a path exists (file or directory).
 * 
 * This function uses fs.promises.access to check if the path exists
 * without throwing an error. It returns a Promise that resolves to
 * a boolean indicating whether the path exists.
 * 
 * @param { string } path - The path to check
 * 
 * @example
 * ```typescript
 * // Check if a file exists
 * const exists = await pathExists('/path/to/file.txt');
 * 
 * if(exists) {
 *   console.log('The file exists.');
 * } else {
 *   console.log('The file does not exist.');
 * }
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { Promise<boolean> } A promise that resolves to true if the path exists, false otherwise
 */
async function pathExists(path: string): Promise<boolean> {
    try {
        await fsPromises.access(path)
        return true
    } catch {
        return false
    }
}

/**
 * Synchronously checks if a path exists (file or directory)
 * 
 * This function uses fs.accessSync to check if the path exists
 * without throwing an error. It returns a boolean indiciating
 * whether the path exists.
 * 
 * @param { string } path - The path to check
 * 
 * @example
 * ```typescript
 * // Check if a directory exists
 * const exists = pathExistsSync('/path/to/directory');
 * 
 * if(exists) {
 *   console.log('The directory exists.');
 * } else {
 *   console.log('The directory does not exist.);
 * }
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { boolean } True if the path exists, false otherwise
 */
function pathExistsSync(path: string): boolean {
    try {
        fs.accessSync(path)
        return true
    } catch {
        return false
    }
}

export {
    pathExists,
    pathExistsSync
}