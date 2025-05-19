import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import {
    execFile as execFileCallback,
    execFileSync as execFileSyncOriginal,
    ExecFileOptions, ExecFileSyncOptions
} from 'node:child_process'

const execFileOriginal = promisify(execFileCallback)

/**
 * Converts a URL or path string to a path string.
 * 
 * @param { URL | string } urlOrPath - The URL or path to convert
 * 
 * @example
 * ```typescript
 * // Convert a URL to a path
 * const path = toPath(new URL('file://path/to/file.txt'));
 * 
 * // Convert a string path (returns the same string)
 * const samePath = toPath('/path/to/file.txt');
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { string } The converted path string
 */
function toPath(urlOrPath: URL | string): string {
    return urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath
}