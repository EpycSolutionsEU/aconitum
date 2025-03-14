import process from 'node:process'

/**
 * Options for the pathKey function
 */
export interface PathKeyOptions {
  /**
   * Environment variables object
   * @default process.env
   */
  env?: NodeJS.ProcessEnv
  
  /**
   * Platform identifier
   * @default process.platform
   */
  platform?: NodeJS.Platform
}

/**
 * Returns the correct environment variable key for the PATH based on the platform
 *
 * On Windows, the environment variable for PATH can be named in different ways
 * (like 'Path', 'PATH', or any case variation). This function finds the correct
 * key for the current environment.
 *
 * On non-Windows platforms, it simply returns 'PATH'.
 *
 * @param options - Configuration options
 * @returns The environment variable key for PATH
 *
 * @example
 * ```typescript
 * // Default usage
 * const key = pathKey()
 * console.log(process.env[key]) // The PATH value
 *
 * // With custom environment
 * const customEnv = { Path: '/usr/bin:/bin' }
 * const key = pathKey({ env: customEnv })
 * ```
 */
export default function pathKey(options: PathKeyOptions = {}): string {
  const {
    env = process.env,
    platform = process.platform,
  } = options

  if(platform !== 'win32') {
    return 'PATH'
  }

  return Object.keys(env).reverse().find((key) => key.toUpperCase() === 'PATH') || 'Path'
}