import {promisify} from 'node:util'
import {execFile as execFileCallback, execFileSync as execFileSyncOriginal, ExecFileOptions, ExecFileSyncOptions} from 'node:child_process'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const execFileOriginal = promisify(execFileCallback)

/**
 * Converts a URL or path string to a path string.
 *
 * @param {URL | string} urlOrPath - The URL or path to convert.
 * @returns {string} The converted path string.
 *
 * @example
 * ```ts
 * // Convert a URL to a path
 * const path = toPath(new URL('file:///path/to/file.txt'))
 * // Convert a string path (returns the same string)
 * const samePath = toPath('/path/to/file.txt')
 * ```
 */
export function toPath(urlOrPath: URL | string): string {
	return urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath
}

/**
 * Gets the root directory of a given path.
 *
 * @param {URL | string} pathInput - The path to get the root directory from.
 * @returns {string} The root directory of the path.
 *
 * @example
 * ```ts
 * // Get the root directory of a path
 * const root = rootDirectory('/path/to/file.txt')
 * // On Unix: '/'
 * // On Windows: 'C:\'
 * ```
 */
export function rootDirectory(pathInput: URL | string): string {
	return path.parse(toPath(pathInput)).root
}

/**
 * Creates an iterable that traverses up the directory tree from a given starting path.
 * Each iteration yields the current path, then moves up one directory level.
 *
 * @param {URL | string} startPath - The starting path to traverse up from.
 * @returns {Iterable<string>} An iterable that yields each directory in the path, starting from the given path and moving up.
 *
 * @example
 * ```ts
 * // Traverse up from a path
 * for (const dir of traversePathUp('/path/to/file.txt')) {
 *   console.log(dir)
 *   // First iteration: '/path/to/file.txt'
 *   // Second iteration: '/path/to'
 *   // Third iteration: '/path'
 *   // Fourth iteration: '/'
 * }
 * ```
 */
export function traversePathUp(startPath: URL | string): Iterable<string> {
	return {
		* [Symbol.iterator]() {
			let currentPath = path.resolve(toPath(startPath))
			let previousPath: string | undefined

			while (previousPath !== currentPath) {
				yield currentPath
				previousPath = currentPath
				currentPath = path.resolve(currentPath, '..')
			}
		},
	}
}

const TEN_MEGABYTES_IN_BYTES = 10 * 1024 * 1024

/**
 * Executes a file with the given arguments and options, returning a promise.
 * This is a wrapper around Node.js's child_process.execFile with some default options.
 *
 * @param {string} file - The path to the file to execute.
 * @param {string[]} arguments_ - The arguments to pass to the file.
 * @param {ExecFileOptions} [options={}] - Options for the execution.
 * @returns {Promise<{stdout: string, stderr: string}>} A promise that resolves with the stdout and stderr.
 *
 * @example
 * ```ts
 * // Execute a command
 * const {stdout, stderr} = await execFile('ls', ['-la'])
 * console.log(stdout)
 * ```
 */
export async function execFile(file: string, arguments_: string[], options: ExecFileOptions = {}): Promise<{stdout: string, stderr: string}> {
	return execFileOriginal(file, arguments_, {
		maxBuffer: TEN_MEGABYTES_IN_BYTES,
		...options,
	})
}

/**
 * Synchronously executes a file with the given arguments and options.
 * This is a wrapper around Node.js's child_process.execFileSync with some default options.
 *
 * @param {string} file - The path to the file to execute.
 * @param {string[]} [arguments_=[]] - The arguments to pass to the file.
 * @param {ExecFileSyncOptions} [options={}] - Options for the execution.
 * @returns {string} The stdout from the executed command.
 *
 * @example
 * ```ts
 * // Execute a command synchronously
 * const output = execFileSync('ls', ['-la'])
 * console.log(output)
 * ```
 */
export function execFileSync(file: string, arguments_: string[] = [], options: ExecFileSyncOptions = {}): string {
	return String(execFileSyncOriginal(file, arguments_, {
		maxBuffer: TEN_MEGABYTES_IN_BYTES,
		encoding: 'utf8',
		stdio: 'pipe',
		...options,
	}))
}

export * from './default.js'