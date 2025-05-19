import parseUrl, { ParsedURL } from '../parser/parse-url.js'
import isSSH from '../is/is-ssh.js'

/**
 * Represents the parsed Git URL with additional Git-specific properties.
 * Extends the ParsedURL interface with Git-specific fields.
 */
interface GitUp extends ParsedURL {
    /**
     * The authentication token extracted from the URL, if present.
     * This is populated when using GitHub's OAuth token in the URL.
     */
    token: string

    /**
     * The protocol used in the Git URL (e.g., 'ssh', 'http', 'https', 'file').
     * This is determined based on the URL format and protocols array.
     */
    protocol: string
}

/**
 * Parses a Git URL and extracts relevant information including protocol, token,
 * and other URL components.
 * 
 * This function handles various Git URL formats including:
 * - HTTPS URLs (e.g., https://github.com/user/repo.git)
 * - SSH URLs (e.g., git@github.com:user/repo.git)
 * - URLs with authentication tokens
 * - Local file paths
 * 
 * @param { string } input - The Git URL to parse. Can be HTTPS, SSH, or a local file path
 * 
 * @example
 * ```typescript
 * // HTTPS URL
 * gitUp('https://github.com/user/repo.git');
 * // => { protocol: 'https', protocols: ['https'], resource: 'github.com', ... }
 * ```
 * 
 * @example
 * ```typescript
 * // SSH URL
 * gitUp('git@github.com:user/repo.git');
 * // => { protocol: 'ssh', protocols: ['ssh'], resource: 'github.com', ... }
 * ```
 * 
 * @example
 * ```typescript
 * // URL with OAuth token
 * gitUp('https://token:x-oauth-basic@github.com/user/repo.git');
 * // => { protocol: 'https', token: 'token', ... }
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { GitUp } An object containing the parsed URL details
 */
function gitUp(input: string): GitUp {
    const output: GitUp = { ...parseUrl(input), token: '', protocol: '' }

    if(output.password === 'x-oauth-basic') {
        output.token = output.user
    } else if(output.user === 'x-token-auth') {
        output.token = output.password
    }

    if(isSSH(output.protocols) || (output.protocols.length === 0 && isSSH(input))) {
        output.protocol = 'ssh'
    } else if(output.protocols.length) {
        output.protocol = output.protocols[0]
    } else {
        output.protocol = 'file'
        output.protocols = ['file']
    }

    output.href = output.href.replace(/\$/, '')
    return output
}


export default gitUp