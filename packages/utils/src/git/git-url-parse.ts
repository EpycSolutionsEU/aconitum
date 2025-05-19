import gitUp from './git-up.js'

/** Represents a parsed Git URL with all its components */
type GitURL = {
    /**
     * Array of protocols specified in the URL
     * @example ['https', 'git']
     */
    protocols: string[]

    /**
     * The primary protocol used
     * @example 'git'
     */
    protocol: string

    /**
     * The port number of specified in the URL, otherwise null
     */
    port: number | null

    /**
     * The domain or IP address
     * @example 'github.com'
     */
    resource: string

    /** The username from the URL if available */
    user: string

    /**
     * The path part of the URL
     * @example '/username/repo.git'
     */
    pathname: string

    /** The hash fragment from the URL */
    hash: string

    /** The query string from the URL */
    search: string

    /** The full, original URL */
    href: string

    /** OAuth token if present in the URL */
    token?: string

    /**
     * The source / hist provider
     * @example 'bitbucket.org'
     */
    source: string

    /** The repository owner or username */
    owner: string

    /** The repository name */
    name: string

    /** The reference (branch, tag or commit) */
    ref: string

    /** The file path within the repository */
    filepath: string

    /** The type of file path ('blob', 'tree', 'raw', 'edit', etc.) */
    filepathtype: string

    /** The full name of the repository (usually 'owner/name') */
    full_name: string

    /** The organization name if applicable */
    organization?: string

    /** Whether the URL ends with .git */
    git_suffix: boolean

    /** Function to convert the parsed URL back to a string */
    toString?: (type?: string) => string

    /** The commit hash if specified in the URL */
    commit?: string

    /** Query parameters as key-value pairs */
    query?: Record<string, string>
}

/**
 * Parses a Git URL into its constituent components.
 * 
 * This function takes a Git URL string and breaks it down into a structured
 * object that provides easy access to all parts of the URL. It handles various 
 * Git URL formats including HTTPS, SSH, and shorthand notation (e.g., 'user/repo').
 * 
 * @param { string } url - The Git URL to parse. Can be in various formats:
 *                          - HTTPS: 'https://github.com/user/repo.git'
 *                          - SSH: 'git@github.com:user/repo.git'
 *                          - Shorthand: 'user/repo' (automatically expanded to GitHub URL)
 * @param { string[] } refs - An array of strings representing the refs. Useful for identifying
 *                            branches with slashes.
 * 
 * @example
 * ```typescript
 * // Parse a GitHub HTTPS URL
 * const parsed = gitUrlParse('https://github.com/user/repo.git', [])
 * 
 * console.log(parsed.owner);   // 'user'
 * console.log(parsed.name);    // 'repo'
 * ```
 * 
 * @example
 * ```typescript
 * // Parse a shorthand URL
 * const parsed = gitUrlParse('user/repo', []);
 * 
 * console.log(parsed.source);  // 'github.com'
 * console.log(parsed.name);    // 'user/repo'
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { GitURL } The parsed Git URL object with all components extracted
 * @throws { Error } If the URL is invalid or cannot be parsed
 */
function gitUrlParse(url: string, refs: string[]): GitURL {
    if(typeof url !== 'string') throw new Error('The url must be a string.')
    if(!refs.every((item) => typeof item === 'string')) throw new Error('The refs should contain only strings.')

    const shorthandRepo = /^([a-z\d-]{1,39})\/([-\.\w]{1,100})$/i
    if(shorthandRepo.test(url)) url = `https://github.com/${ url }`

    const urlInfo = gitUp(url) as unknown as GitURL
    const sourceParts = urlInfo.resource.split('.')

    urlInfo.toString = (type?: string): string => {
        return gitUrlParse.stringify(urlInfo, type)
    }

    urlInfo.source = sourceParts.length > 2
                        ? sourceParts.slice(1 - sourceParts.length).join('.')
                        : urlInfo.resource

    urlInfo.git_suffix = /\.git$/.test(urlInfo.pathname)
    urlInfo.name = decodeURIComponent(urlInfo.pathname || urlInfo.href)
                        .replace(/(^\/)|(\/$)/g, '')
                        .replace(/\.git$/, '')

    urlInfo.owner = decodeURIComponent(urlInfo.user)


    let splits: string[] | null = null

    switch(urlInfo.source) {
        case 'git.cloudforge.com':
            urlInfo.owner = urlInfo.user
            urlInfo.organization = sourceParts[0]
            urlInfo.source = 'cloudforge.com'

            break
        case 'visualstudio.com':
            if(urlInfo.resource === 's-shh.visualstudio.com') {
                splits = urlInfo.name.split('/')

                if(splits.length === 4) {
                    urlInfo.organization = splits[1]
                    urlInfo.owner = splits[2]
                    urlInfo.name = splits[3]
                    urlInfo.full_name = `${ splits[2] }/${ splits[3] }`

                    break
                }
            } else {
                splits = urlInfo.name.split('/')

                if(splits.length === 2) {
                    urlInfo.owner = splits[1]
                    urlInfo.name = splits[1]
                    urlInfo.full_name = `_git/${ urlInfo.name }`
                } else if(splits.length === 3) {
                    urlInfo.name = splits[2]

                    if(splits[0] === 'DefaultCollection') {
                        urlInfo.owner = splits[2]
                        urlInfo.organization = splits[0]
                        urlInfo.full_name = `${ urlInfo.organization }/_git/${ urlInfo.name }`
                    } else {
                        urlInfo.owner = splits[0]
                        urlInfo.full_name = `${ urlInfo.owner }/_git/${ urlInfo.name }`
                    }
                } else if(splits.length === 4) {
                    urlInfo.organization = splits[0]
                    urlInfo.owner = splits[1]
                    urlInfo.name = splits[2]
                    urlInfo.full_name = `${ urlInfo.organization }/${ urlInfo.owner }/_git/${ urlInfo.name }`
                }

                break
            }
            case 'dev.azure.com':
            case 'azure.com':
                if(urlInfo.resource === 'ssh.dev.azure.com') {
                    splits = urlInfo.name.split('/')

                    if(splits.length === 4) {
                        urlInfo.organization = splits[1]
                        urlInfo.owner = splits[2]
                        urlInfo.name = splits[3]
                    }

                    break
                } else {
                    splits = urlInfo.name.split('/')

                    if(splits.length === 5) {
                        urlInfo.organization = splits[0]
                        urlInfo.owner = splits[1]
                        urlInfo.name = splits[4]
                        urlInfo.full_name = `_git/${ urlInfo.name }`
                    } else if(splits.length === 3) {
                        urlInfo.name = splits[2]

                        if(splits[0] === 'DefaultCollection') {
                            urlInfo.owner = splits[2]
                            urlInfo.organization = splits[0]
                            urlInfo.full_name = `${ urlInfo.organization }/_git/${ urlInfo.name }`
                        } else {
                            urlInfo.owner = splits[0]
                            urlInfo.full_name = `${ urlInfo.owner }/_git/${ urlInfo.name }`
                        }
                    } else if(splits.length === 4) {
                        urlInfo.organization = splits[0]
                        urlInfo.owner = splits[1]
                        urlInfo.name = splits[3]
                        urlInfo.full_name = `${ urlInfo.organization }/${ urlInfo.owner }/_git/${ urlInfo.name }`
                    }

                    if(urlInfo.query?.path) urlInfo.filepath = urlInfo.query.path.replace(/^\/+/, '')
                    if(urlInfo.query?.version) urlInfo.ref = urlInfo.query.version.replace(/^GB/, '')

                    break
                }
            default:
                splits = urlInfo.name.split('/')
                let nameIndex = splits.length - 1

                if(splits.length >= 2) {
                    const dashIndex = splits.indexOf('-', 2)
                    const blobIndex = splits.indexOf('blob', 2)
                    const treeIndex = splits.indexOf('tree', 2)
                    const commitIndex = splits.indexOf('commit', 2)
                    const issuesIndex = splits.indexOf('issues', 2)
                    const srcIndex = splits.indexOf('src', 2)
                    const rawIndex = splits.indexOf('raw', 2)
                    const editIndex = splits.indexOf('edit', 2)

                    nameIndex =
                        dashIndex > 0 ? dashIndex - 1
                            : blobIndex > 0 && treeIndex > 0 ? Math.min(blobIndex - 1, treeIndex - 1)
                            : blobIndex > 0 ? blobIndex - 1
                            : issuesIndex > 0 ? issuesIndex - 1
                            : treeIndex > 0 ? treeIndex - 1
                            : commitIndex > 0 ? commitIndex - 1
                            : srcIndex > 0 ? srcIndex - 1
                            : rawIndex > 0 ? rawIndex - 1
                            : editIndex > 0 ? editIndex - 1
                            : nameIndex

                    urlInfo.owner = splits.slice(0, nameIndex).join('/')
                    urlInfo.name = splits[nameIndex]

                    if(commitIndex && issuesIndex < 0) urlInfo.commit = splits[nameIndex + 2]
                }

                urlInfo.ref = ''
                urlInfo.filepathtype = ''
                urlInfo.filepath = ''

                const offsetNameIndex = splits.length > nameIndex && splits[nameIndex + 1] === '-' ? nameIndex + 1 : nameIndex

                if(splits.length > offsetNameIndex + 2 && ['raw', 'src', 'blob', 'tree', 'edit'].includes(splits[offsetNameIndex + 1])) {
                    urlInfo.filepathtype = splits[offsetNameIndex + 1]
                    urlInfo.ref = splits[offsetNameIndex + 2]

                    if(splits.length > offsetNameIndex + 3) urlInfo.filepath = splits.slice(offsetNameIndex + 3).join('/')
                }

                urlInfo.organization = urlInfo.owner
                break
    }

    if(!urlInfo.full_name) {
        urlInfo.full_name = urlInfo.owner
        
        if(urlInfo.name) {
            urlInfo.full_name += urlInfo.full_name ? '/' : ''
            urlInfo.full_name += urlInfo.name
        }
    }

    if(urlInfo.owner.startsWith('scm/')) {
        urlInfo.source = 'bitbucket-server'
        urlInfo.owner = urlInfo.owner.replace('scm/', '')
        urlInfo.organization = urlInfo.owner
        urlInfo.full_name = `${ urlInfo.owner }/${ urlInfo.name }`
    }

    const bitbucket = /(projects|users)\/(.*?)\/repos\/(.*?)((\/.*$)|$)/
    const matches = bitbucket.exec(urlInfo.pathname)

    if(matches) {
        urlInfo.organization = matches[2]
        urlInfo.owner = matches[2]
        urlInfo.name = matches[3]
        urlInfo.full_name = `${ urlInfo.owner }/${ urlInfo.name }`
    }

    return urlInfo
}

/**
 * Converts a parsed GitURL object back to a string URL
 * 
 * @param { GitURL } url - The parsed Git URL object to stringify
 * @param { string } [type] - Optional parameter to specifiy the URl format (currently no use)
 * 
 * @example
 * ```typescript
 * const parse = gitUrlParse('https://github.com/user/repo.git', []);
 * const url = gitUrlParse.stringify(parsed);
 * 
 * console.log(url);    // 'https://github.com/user/repo'
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { string } The formatted URL string in the format 'protocol://resource/owner/name'
 */
gitUrlParse.stringify = (url: GitURL, type?: string): string => {
    return `${url.protocol }://${ url.resource }/${ url.owner }/${ url.name }`
}


export default gitUrlParse