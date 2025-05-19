import normalizeUrl, { NormalizeOptions as NormalizeURLOptions } from '../normalize-url.js'
import parsePath, { ParsedPath } from './parse-path.js'

/** Interface for the parsed URL result */
export interface ParsedURL extends ParsedPath {
    /**
     * Array of protocols dfetected in the URL.
     * @example ['http', 'https']
     */
    protocols: string[]

    /**
     * Primary protocol of the URL or null if not detected.
     * @example 'http' | null
     */
    protocol: string

    /**
     * Port specified in the URL or null if not detected.
     * @example 8080
     */
    port: string | null

    /**
     * Hostname without port
     * @example example.com
     */
    resource: string

    /**
     * Full host including port if specified
     * @example example.com:8080
     */
    host: string

    /** Username specified in the URL or empty string if none */
    user: string

    /**
     * Path component of the URL
     * @example '/path/to/resource'
     */
    pathname: string

    /** Fragment identifier without the leading hashtag (#) */
    hash: string

    /** Query string without the leading questionmark (?) */
    search: string

    /** Original or normalized URL string */
    href: string

    /** Parsed query parameters as key-value pairs */
    query: Record<string, string>

    /** Indicated whether URL parsing failed */
    parse_failed: boolean
}

/** Type fo the normalize parameter */
type NormalizeOption = boolean | NormalizeURLOptions


/**
 * Parses the input URL into its component parts.
 * 
 * This function handles various URL formats including HTTP(S) URLs and 
 * SSH URLs (git repository URLs). It provides detailed parsing of all
 * URL components and can optionally normalize the URL before parsing.
 * 
 * **NOTE**: This function *throws* an Error if invalid URLs are provided.
 * 
 * @param { string } url - The input URL to parse. Can be HTTP, HTTPS, or SSH URL format
 * @param { NormalizeOption } [normalize=false] - Controls URL normalization:
 *                      - If `false` (default): No normalization is performed
 *                      - If `true`: The URL will be normalized with default options
 *                      - If an object: Used as options for [`normalize-url`]({@link ./normalize-url})
 *                      - Note: Normalization doesn't work for SSH URLs
 * 
 * @example
 * ```typescript
 * // Parse a standard HTTP URL
 * const result = parseUrl('https://example.com/path?query=value#fragment');
 * 
 * // result.protocol === 'https'
 * // result.resource === 'example.com'
 * // result.pathname === '/path'
 * // result.query === { query: 'value' }
 * ```
 * 
 * @example
 * ```typescript
 * // Parse a Git SSH URL
 * const result = parseUrl('git@github.com:username/repo.git');
 * 
 * // result.protocol === 'ssh'
 * // result.user === 'git'
 * // result.resource === 'github.com'
 * // result.pathname === /username/repo.git'
 * ```
 * 
 * @example
 * ```typescript
 * // Parse with normalization
 * const result = parseUrl('HTTP://ExAmPle.COM/./path/, true);
 * 
 * // URL will be normalized before parsing.
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { ParsedURL } An object containing all parsed URL components
 * @throws { Error } Throws an error if the URL is invalid, empty, or exceeds maximum length
 */
const parseUrl = (url: string, normalize: NormalizeOption = false): ParsedURL => {
    const GIT_REPOSITORY = /^(?:([a-zA-Z_][a-zA-Z0-9_-]{0,31})@|https?:\/\/)([\w.\-@]+)[/:](([\~.\w\-_/,\s]|%[0-9A-Fa-f]{2})+?(?:\.git|\/)?)$/

    const throwError = (message: string): never => {
        const error = new Error(message);
        (error as any).subject_url = url

        throw error
    }

    if(typeof url !== 'string' || !url.trim()) throwError('Invalid URL.')

    if(url.length > parseUrl.MAX_INPUT_LENGTH)
        throwError('Input exceeds maximum length. If needed, change the value of parseUrl.MAX_INPUT_LENGTH.')

    if(normalize) {
        if(typeof normalize !== 'object') normalize = { stripHash: false }
        url = normalizeUrl(url, normalize)
    }

    const parsed = parsePath(url)

    // Potential git-ssh URLs
    if(parsed.parse_failed) {
        const matched = parsed.href.match(GIT_REPOSITORY)

        if(matched) {
            parsed.protocols = ['ssh']
            parsed.protocol = 'ssh'
            parsed.resource = matched[2]
            parsed.host = matched[2]
            parsed.user = matched[1]
            parsed.pathname = `/${ matched[3] }`
            
            parsed.parse_failed = false
        } else {
            throwError('URL parsing failed.')
        }
    }

    return parsed as ParsedURL
}

parseUrl.MAX_INPUT_LENGTH = 2048


export default parseUrl