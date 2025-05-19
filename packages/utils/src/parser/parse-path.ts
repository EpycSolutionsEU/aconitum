import protocols from '../protocols.js'

/** Interface representing the parsed components of a URL path */
export interface ParsedPath {
    /**
     * Array of protocols dfetected in the URL.
     * @example ['http', 'https']
     */
    protocols: string[]

    /**
     * Primary protocol of the URL or null if not detected.
     * @example 'http' | null
     */
    protocol: string | null

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

    /** Password specified in the URL or empty string if none */
    password: string

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

/**
 * Parses a URL string into its component parts
 * 
 * This function attempts to parse a URL using the built-in URL constructor.
 * If parsing succeeds, it extracts various components like procotol, host, etc.
 * If parsing fails (e.g. for invalid URLs), it sets parse_failed to true and
 * defaults to trating it as a file protocol.
 * 
 * @param { string } path - The URL string to parse
 * 
 * @example
 * ```typescript
 * // Successful parsing
 * const result = parsePath('https://user:pass@example.com:8080/path?query=value#fragment');
 * 
 * // Output:
 * // result.protocol === 'https'
 * // result.user === 'user'
 * // result.password === 'pass'
 * // result.resource === 'example.com'
 * // result.port === '8080'
 * // result.pathname === '/path'
 * // result.search === 'query=value'
 * // result.hash === 'fragment'
 * // result.parse_failed === false
 * ```
 * 
 * @example
 * ```typescript
 * // Failed parsing
 * const result = parsePath('invalid_url');
 * 
 * // Output:
 * // result.protocol = 'file'
 * // result.parse_failed === true
 * ```
 * 
 * @since Introduced in v0.1.0
 * @return { ParsedPath } An object containing the parsed URL components
 */
function parsePath(path: string): ParsedPath {
    const output: ParsedPath = {
        protocols: [],
        protocol: null,
        port: null,
        resource: '',
        host: '',
        user: '',
        password: '',
        pathname: '',
        hash: '',
        search: '',
        href: path,
        query: {},
        parse_failed: false
    }

    try {
        const parsed = new URL(path)

        output.protocols = protocols(parsed) as string[]
        output.protocol = output.protocols[0]
        output.port = parsed.port
        output.resource = parsed.hostname
        output.host = parsed.host
        output.user = parsed.username || ''
        output.password = parsed.password || ''
        output.hash = parsed.hash.slice(1)
        output.search = parsed.search.slice(1)
        output.href = parsed.href
        output.query = Object.fromEntries(parsed.searchParams) as Record<string, string>
    } catch (error) {
        // Check if it is a valid local file path
        // Common file path patterns for different operating systems
        const isWindowsPath = /^([a-zA-Z]:\\|\\\\)([^<>:"/\\|?*]+\\)*([^<>:"/\\|?*]+)?$/.test(path)
        const isUnixPath = /^(\/([^<>:"/\\|?*]+\/)*([^<>:"/\\|?*]+)?|\.{1,2}(\/([^<>:"/\\|?*]+\/)*([^<>:"/\\|?*]+)?)?)$/.test(path)
        const isRelativePath = /^[^<>:"/\\|?*]+(\/[^<>:"/\\|?*]+)*\/?$/.test(path)

        const isLikelyFilePath = isWindowsPath || isUnixPath || isRelativePath

        output.protocols = ['file']
        output.protocol = output.protocols[0]
        output.port = ''
        output.resource = ''
        output.user = ''
        output.hash = ''
        output.search = ''
        output.href = path
        output.query = {}

        if(isLikelyFilePath) {
            // For file paths, set the pathname to the path
            output.pathname = path
            output.parse_failed = false
        } else {
            output.pathname = ''
            output.parse_failed = true
        }
    }

    return output
}


export default parsePath