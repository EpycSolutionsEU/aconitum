import fs, { promises as fsPromises } from 'node:fs'

/**
 * Asynchronously checks if a path exists (file or directory)
 *
 * This function uses fs.promises.access to check if the path exists
 * without throwing an error. It returns a Promise that resolves to
 * a boolean indicating whether the path exists.
 *
 * @param {string} path - The path to check
 * @returns {Promise<boolean>} A promise that resolves to true if the path exists, false otherwise
 *
 * @example
 * ```ts
 * // Check if a file exists
 * const exists = await pathExists('/path/to/file.txt')
 * if (exists) {
 *   console.log('File exists!')
 * } else {
 *   console.log('File does not exist')
 * }
 * ```
 */
export async function pathExists(path: string): Promise<boolean> {
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
 * without throwing an error. It returns a boolean indicating
 * whether the path exists.
 *
 * @param {string} path - The path to check
 * @returns {boolean} True if the path exists, false otherwise
 *
 * @example
 * ```ts
 * // Check if a directory exists
 * const exists = pathExistsSync('/path/to/directory')
 * if (exists) {
 *   console.log('Directory exists!')
 * } else {
 *   console.log('Directory does not exist')
 * }
 * ```
 */
export function pathExistsSync(path: string): boolean {
	try {
		fs.accessSync(path)
		return true
	} catch {
		return false
	}
}