import { env } from 'node:process'

/**
 * Detects whether the current environment is running in a Continuous Integration (CI) system.
 * 
 * This utility checks various environment variables commonly set by CI providers to determine
 * ifthhe code is executing in a CI environment. It looks for:
 * - The presence of a `CI` environment variable that isn't explicitly set to '0' or 'false'
 * - The presence of a `CONTINUOUS_INTEGRATION` environment variable
 * - Any environment variable that starts with `CI_` (common in many CI systems)
 * 
 * @example
 * ```typescript
 * import { isInCi } from '@aconitum/utils';
 * 
 * if(isInCi) {
 *   console.log('This is running in a CI environment.');
 * } else {
 *   console.log('This is running in a local environment.');
 * }
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { boolean } True if running in a CI environment, false otherwise
 */
const isInCi: boolean =
    env.CI !== '0'
    && env.CI !== 'false'
    && (
        'CI' in env
            || 'CONTINUOUS_INTEGRATION' in env
            || Object.keys(env).some(key => key.startsWith('CI_'))
    )


export default isInCi