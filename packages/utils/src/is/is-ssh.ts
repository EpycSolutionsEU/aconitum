import protocols from '../protocols.js'

/**
 * Checks if an input value is an SSH URL or not.
 * 
 * This function can determine if a URL uses SSH protocol by:
 * 1. Checking if the protocol array contains 'ssh' or 'rsync'
 * 2. Extracting and analyzing the protocol from a URL string
 * 3. Examining the URL structure for SSH specific patterns (user@host:path)
 * 
 * @param { string | string[] } input - The input to check:
 *                                      - If array: List of protocols to check for SSH protocols
 *                                      - If string: URL to analyze for SSH format
 * 
 * @example
 * ```typescript
 * import { isSSH } from '@aconitum/utils';
 * 
 * // Check by protocols array.
 * isSSH(['ssh', 'git']);       // true
 * isSSH(['https', 'http']);    // false
 * 
 * // Check by URL string.
 * isSSH('ssh://user@example.com/repo.git');    // true
 * isSSH('user@example.com:path/to/repo.git');  // true
 * isSSH('https://example.com/repo.git');       // false
 * ```
 * 
 * @since Introduced in v0.1.0
 * @return { boolean } `true` if the input is an SSH URL, `false` otherwise
 */
function isSSH(input: string | string[]): boolean {
    if(Array.isArray(input)) return input.includes('ssh') || input.includes('rsync')
    if(typeof input !== 'string') return false

    const prots = protocols(input)
    input = input.substring(input.indexOf('://') + 3)

    if(isSSH(prots)) return true

    // Match URLs with port patterns and check for SSH-like structure

    const urlPortPattern = /\.([a-zA-Z\d]+):(\d+)\/?/
    return !urlPortPattern.test(input) && input.indexOf('@') > input.indexOf(':')
}


export default isSSH