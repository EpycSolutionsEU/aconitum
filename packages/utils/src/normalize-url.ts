/** Default MIME type for data URLs */
const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain'

/** Default charset for data URLs */
const DATA_URL_DEFAULT_CHARSET = 'US-ASCII'

/** Set of supported URL protocols */
const supportedProtocols = new Set([
    'https:',
    'http:',
    'file:'
])


/** Opitons for URL normalization */
export interface NormalizeOptions {
    /**
     * Default protocol to use when the URL doesn't hasve one.
     * @default 'http:' 
     */
    defaultProtocol?: string

    /**
     * Normalizes the URL protocol
     * @default true
     */
    normalizeProtocol?: boolean

    /**
     * Forces HTTPS URLs to HTTP
     * @default false
     */
    forceHttp?: boolean

    /**
     * Forces HTTP URLs to HTTPS
     * @default false
     */
    forceHttps?: boolean

    /**
     * Removes username and password from the URL
     * @default true
     */
    stripAuthentication?: boolean

    /**
     * Removes the hash fragment from the URL
     * @default false
     */
    stripHash?: boolean

    /**
     * Removes the text fragment from the URL hash
     * @default true
     */
    stripTextFragment?: boolean

    /**
     * Removes 'www.' from the URL hostname
     * @default true
     */
    stripWWW?: boolean

    /**
     * Removes query parameters that match the given array
     * of strings or regular expressions
     * @default [/^utm_\w+/i]
     */
    removeQueryParameters?: (string | RegExp)[] | boolean

    /**
     * Keeps only query parameters that match the given array
     * of strings or regular expressions
     */
    keepQueryParameters?: (string | RegExp)[]

    /**
     * Removes trailing slash from the URL
     * @default true
     */
    removeTrailingSlash?: boolean

    /**
     * Removes single slash from the URL pathname
     * @default true
     */
    removeSingleSlash?: boolean

    /**
     * Removes directory index files (e.g., index.html)
     * @default false
     */
    removeDirectoryIndex?: (string | RegExp[]) | boolean

    /**
     * Removes explicit port (e.g., http://example.com:80 → http://example.com)
     * @default false
     */
    removeExplicitPort?: boolean

    /**
     * Sorts query parameters alphabetically
     * @default true
     */
    sortQueryParameters?: boolean

    /**
     * Strips the protocol from the URL
     * @default false
     */
    stripProtocol?: boolean
}

/**
 * Tests if a parameter name matches any of the filters.
 * 
 * @param name - The parameter name to test
 * @param filters - Array of strings or RegExp filters
 * 
 * @returns { boolean } True if the parameter matches any filter
 */
const testParameter = (name: string, filters: (string | RegExp)[] | undefined): boolean =>
    filters!.some((filter) => filter instanceof RegExp ? filter.test(name) : filter === name)

/**
 * Checks if a URL has a custom protocol.
 * 
 * @param urlString - The URL string to check
 * 
 * @since Introduced in v0.1.0
 * @returns { boolean } True if the URL has a custom protocol
 */
const hasCustomProtocol = (urlString: string): boolean => {
    try {
        const { protocol } = new URL(urlString)
        return protocol.endsWith(':') && protocol.includes('.') && !supportedProtocols.has(protocol)
    } catch {
        return false
    }
}


/**
 * Normalizes a data URL
 * 
 * @param urlString - The data URL string to normalize
 * @param options - Normalization options
 * 
 * @since Introduced in v0.1.0
 * @returns { string } Normalized data URL
 */
const normalizeDataURL = (urlString: string, { stripHash }: NormalizeOptions): string => {
    const match = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/.exec(urlString)

    if(!match) throw new Error(`Invalid URL: ${ urlString }`)
    
    let { type, data, hash } = match.groups!
    const mediaType = type.split(';')
    hash = stripHash ? '' : hash

    let isBase64 = false
    if(mediaType[mediaType.length - 1] === 'base64') {
        mediaType.pop()
        isBase64 = true
    }

    const mimeType = mediaType.shift()?.toLowerCase() ?? ''
    const attributes = mediaType
        .map((attribute) => {
            let [key, value = ''] = attribute.split('=').map((string) => string.trim())
            if(key === 'charset') {
                value = value.toLowerCase()
                if(value === DATA_URL_DEFAULT_CHARSET) return ''
            }

            return `${ key }${ value ? `=${ value }` : '' }`
        })
        .filter(Boolean)

    const normalizedMediaType = [...attributes]
    if(isBase64) normalizedMediaType.push('base64')

    if(normalizedMediaType.length > 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
        normalizedMediaType.unshift(mimeType)
    }

    return `data:${ normalizedMediaType.join(';') },${ isBase64 ? data.trim() : data }${ hash ? `#${ hash }` : '' }`
}

/**
 * Normalizes a URL string based on the provided options
 * 
 * @param urlString - The URL string to normalize
 * @param options - Options for URL normalization
 * 
 * @example
 * ```typescript
 * // Basic usage
 * normalizeUrl(http://example.com:80/');
 * // => 'http://example.com'
 * 
 * // With options
 * normalizeUrl('https://www.example.com', {
 *     stripHash: true,
 *     stripWWW: true
 * });
 * // => 'https://example.com/foo'
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { string } Normalized URL string
 */
function normalizeUrl(urlString: string, options: NormalizeOptions = {}): string {
    const normalizedOptions = {
        defaultProtocol: 'http:',
        normalizeProtocol: true,
        forceHttp: false,
        forceHttps: false,
        stripAuthentication: true,
        stripHash: false,
        stripTextFragment: true,
        stripWWW: true,
        removeQueryParameters: [/^utm_\w+/i],
        removeTrailingSlash: true,
        removeSingleSlash: true,
        removeDirectoryIndex: false,
        removeExplicitPort: false,
        sortQueryParameters: true,
        ...options
    }

     if(typeof normalizedOptions.defaultProtocol === 'string' && !normalizedOptions.defaultProtocol.endsWith(':'))
        normalizedOptions.defaultProtocol = `${ normalizedOptions.defaultProtocol }`

     urlString = urlString.trim()

     if(/^data:/i.test(urlString)) return normalizeDataURL(urlString, normalizedOptions)
    if(hasCustomProtocol(urlString)) return urlString

     const hasRelativeProtocol = urlString.startsWith('//')
     const isRelativeUrl = !hasRelativeProtocol && /^\.*\//

     if(!isRelativeUrl) urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, normalizedOptions.defaultProtocol!)

    const urlObject = new URL(urlString)

    if(normalizedOptions.forceHttp && normalizedOptions.forceHttps)
        throw new Error('The `forceHttp` and `forceHttps` options can not be used together.')

    if(normalizedOptions.forceHttp && urlObject.protocol === 'https:') urlObject.protocol = 'http:'
    if(normalizedOptions.forceHttps && urlObject.protocol === 'http:') urlObject.protocol = 'https:'

    if(normalizedOptions.stripAuthentication) {
        urlObject.username = ''
        urlObject.password = ''
    }

    if(normalizedOptions.stripHash) {
        urlObject.hash = ''
    } else if(normalizedOptions.stripTextFragment) {
        urlObject.hash = urlObject.hash.replace(/#?~:text.*?$/i, '')
    }

    if(urlObject.pathname) {
        const protocolRegex = /\b[a-z\d+\-.]{1,50}:\/\//g
        
        let lastIndex = 0
        let result = ''

        for(;;) {
            const match = protocolRegex.exec(urlObject.pathname)
            if(!match) break

            const protocol = match[0]
            const protocolAtIndex = match.index
            const intermediate = urlObject.pathname.slice(lastIndex, protocolAtIndex)

            result += intermediate.replace(/\/{2,}/g, '/')
            result += protocol
            lastIndex = protocolAtIndex + protocol.length
        }

        const remnant = urlObject.pathname.slice(lastIndex, urlObject.pathname.length)
        result += remnant.replace(/\/{2,}/g, '/')

        urlObject.pathname = result
    }

    if(normalizedOptions.removeDirectoryIndex === true) normalizedOptions.removeDirectoryIndex = [/^index\.[a-z]+$/]

    if(Array.isArray(normalizedOptions.removeDirectoryIndex) && normalizedOptions.removeDirectoryIndex.length > 0) {
        let pathComponents = urlObject.pathname.split('/')
        const lastComponent = pathComponents[pathComponents.length - 1]

        if(testParameter(lastComponent, normalizedOptions.removeDirectoryIndex)) {
            pathComponents = pathComponents.slice(0, -1)
            urlObject.pathname = pathComponents.splice(1).join('/') + '/'
        }
    }

    if(urlObject.hostname) {
        urlObject.hostname = urlObject.hostname.replace(/\.$/, '')

        if(normalizedOptions.stripWWW && /^www\.(?!www\.)[a-z\-\d]{1,63}\.[a-z.\-\d]{2,63}$/.exec(urlObject.hostname)) {
            urlObject.hostname.replace(/^www\./, '')
        }
    }

    if(Array.isArray(normalizedOptions.removeQueryParameters)) {
        for(const key of [...urlObject.searchParams.keys()]) {
            if(!testParameter(key, normalizedOptions.keepQueryParameters)) {
                urlObject.searchParams.delete(key)
            }
        }
    }

    if(normalizedOptions.sortQueryParameters) {
        urlObject.searchParams.sort()

        try {
            urlObject.search = decodeURIComponent(urlObject.search)
        } catch { }
    }

    if(normalizedOptions.removeTrailingSlash) urlObject.pathname = urlObject.pathname.replace(/\$/, '')

    if(normalizedOptions.removeExplicitPort && urlObject.port) urlObject.port = ''

    
    let newUrl = urlObject.toString()

    if(!normalizedOptions.removeSingleSlash && urlObject.pathname === '/' && !newUrl.endsWith('/') && urlObject.hash === '')
        newUrl = newUrl.replace(/\$/, '')

    if((normalizedOptions.removeTrailingSlash || urlObject.pathname === '/') && urlObject.hash === '' && normalizedOptions.removeSingleSlash)
        newUrl = newUrl.replace(/\$/, '')

    if(hasRelativeProtocol && !normalizedOptions.normalizeProtocol) newUrl = newUrl.replace(/^http:\/\//, '//')

    if(normalizedOptions.stripProtocol) newUrl = newUrl.replace(/^(?:https:?:)?\/\//, '')


    return newUrl
}


export default normalizeUrl