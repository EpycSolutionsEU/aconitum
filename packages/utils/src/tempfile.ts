import path from 'node:path'
import { randomUUID } from 'node:crypto'

import tempDirectory from './tempdir'

/**
 * Options for the tempfile function
 */
export interface TempfileOptions {
  /**
   * File extension to append to the temporary filename
   * If provided as a string without a leading dot, a dot will be prepended
   */
  extension?: string
}

/**
 * Creates a path to a temporary file with a random name
 *
 * @param options - Configuration options
 * @returns Path to a temporary file
 *
 * @example
 * ```typescript
 * // Default usage (no extension)
 * const tempPath = tempfile()
 * // => '/tmp/550e8400-e29b-41d4-a716-446655440000'
 *
 * // With extension
 * const tempPath = tempfile({ extension: '.txt' })
 * // => '/tmp/550e8400-e29b-41d4-a716-446655440000.txt'
 *
 * // Extension without leading dot
 * const tempPath = tempfile({ extension: 'json' })
 * // => '/tmp/550e8400-e29b-41d4-a716-446655440000.json'
 * ```
 */
export default function tempfile(options: TempfileOptions = {}): string {
  let { extension } = options

  if(typeof extension === 'string') {
    extension = extension.startsWith('.') ? extension : `.${ extension }`
  }

  return path.join(tempDirectory, randomUUID() + (extension ?? ''))
}