import process from 'node:process'
import path from 'node:path'

import pathKey from './path-key'
import { toPath, traversePathUp } from './corn-magic/node'

/**
 * Options for configuring the npm run path
 */
export interface NpmRunPathOptions {
  /**
   * Current working directory
   * @default process.cwd()
   */
  cwd?: string | URL

  /**
   * Path environment variable value
   * @default process.env[pathKey()]
   */
  path?: string

  /**
   * Prefer local node_modules/.bin over global
   * @default true
   */
  preferLocal?: boolean

  /**
   * Path to the Node.js executable
   * @default process.execPath
   */
  execPath?: string

  /**
   * Add the Node.js executable path to the PATH
   * @default true
   */
  addExecPath?: boolean
}

/**
 * Options for configuring the npm run path environment
 */
export interface NpmRunPathEnvOptions extends Omit<NpmRunPathOptions, 'path'> {
  /**
   * Environment variables object
   * @default process.env
   */
  env?: NodeJS.ProcessEnv
}

/**
 * Get the npm run path by combining local node_modules/.bin paths with the existing PATH
 *
 * This is particularly useful for running local binaries in npm scripts
 *
 * @param options - Configuration options
 * @returns The modified PATH value
 *
 * @example
 * ```typescript
 * // Default usage
 * const path = npmRunPath()
 *
 * // With custom working directory
 * const path = npmRunPath({ cwd: '/path/to/project' })
 *
 * // Without local node_modules/.bin
 * const path = npmRunPath({ preferLocal: false })
 * ```
 */
export const npmRunPath = ({
  cwd = process.cwd(),
  path: pathOption = process.env[pathKey()],
  preferLocal = true,
  execPath = process.execPath,
  addExecPath = true,
}: NpmRunPathOptions = {}): string => {
  const cwdPath = path.resolve(toPath(cwd))
  const result: string[] = []
  const pathParts = pathOption?.split(path.delimiter) ?? []

  if (preferLocal) {
    applyPreferLocal(result, pathParts, cwdPath)
  }

  if (addExecPath) {
    applyExecPath(result, pathParts, execPath, cwdPath)
  }

  return pathOption === '' || pathOption === path.delimiter
    ? `${result.join(path.delimiter)}${pathOption}`
    : [...result, pathOption].join(path.delimiter)
}

/**
 * Add local node_modules/.bin paths to the result array
 */
const applyPreferLocal = (result: string[], pathParts: string[], cwdPath: string): void => {
  for (const directory of traversePathUp(cwdPath)) {
    const pathPart = path.join(directory, 'node_modules/.bin')
    if (!pathParts.includes(pathPart)) {
      result.push(pathPart)
    }
  }
}

/**
 * Add the Node.js executable path to the result array
 */
const applyExecPath = (result: string[], pathParts: string[], execPath: string, cwdPath: string): void => {
  const pathPart = path.resolve(cwdPath, toPath(execPath), '..')
  if (!pathParts.includes(pathPart)) {
    result.push(pathPart)
  }
}

/**
 * Get a copy of the environment variables with the npm run path applied
 *
 * @param options - Configuration options
 * @returns A new environment variables object
 *
 * @example
 * ```typescript
 * // Default usage
 * const env = npmRunPathEnv()
 *
 * // With custom environment
 * const env = npmRunPathEnv({
 *   env: { PATH: '/usr/bin' },
 *   preferLocal: false
 * })
 * ```
 */
export const npmRunPathEnv = ({ env = process.env, ...options }: NpmRunPathEnvOptions = {}): NodeJS.ProcessEnv => {
  env = { ...env }

  const pathName = pathKey({ env })
  const path = env[pathName]
  env[pathName] = npmRunPath({ ...options, path })

  return env
}