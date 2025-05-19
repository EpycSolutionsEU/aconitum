/**
 * Options for fetching GitHub releases
 */
export interface GithubReleasesOptions {
  /** The GitHub repository in format 'username/project' */
  repo: string

  /** GitHub personal access token */
  token?: string

  /** GitHub username (for basic auth) */
  user?: string

  /** GitHub password (for basic auth) */
  password?: string
}

/**
 * GitHub API response headers
 */
interface RateLimitHeaders {
  'x-ratelimit-limit': string
  'x-ratelimit-remaining': string
  'x-ratelimit-reset': string
}

/**
 * Fetch releases from GitHub repository
 * 
 * @param { GithubReleasesOptions } options - Configuration options
 * 
 * @example
 * ```typescript
 * // Using token authentication
 * const releases = await githubReleases({ 
 *   repo: 'user/repo',
 *   token: 'github-token'
 * });
 * 
 * // Using basic authentication
 * const releases = await githubReleases({
 *   repo: 'user/repo',
 *   user: 'username',
 *   password: 'password'
 * });
 * ```
 * 
 * @throws { Error } If options or repo is not provided
 * @throws { Error } If rate limit is exceeded
 * 
 * @since Introduced in v0.2.0
 * @returns { Promise<any> } Promise resolving to the releases data
 */
async function githubReleases(options: GithubReleasesOptions): Promise<any> {
  if(!options) throw new Error('config required')
  if(!options.repo) throw new Error('github repo required')

  return fetchTags(options)
}

/**
 * Fetch tags from GitHub repository
 * 
 * @param { GithubReleasesOptions } options - Configuration options
 * 
 * @internal
 * @returns { Promise<any> } Promise resolving to the tags data
 */
async function fetchTags(options: GithubReleasesOptions): Promise<any> {
  const url = getReleasesUrl(options)
  
  const headers: Record<string, string> = { 
    'User-Agent': 'aconitum_github-lookup'
  }

  if(options.token) {
    headers.Authorization = `Bearer ${ options.token }`
  } else if(options.user && options.password) {
    headers.Authorization = `Basic ${ getBasicAuth(options) }`
  }

  const response = await fetch(url, {
    headers,
    method: 'GET'
  })

  // Handle rate limiting
  const limit = parseInt(response.headers.get('x-ratelimit-limit') || '0', 10)
  const remaining = parseInt(response.headers.get('x-ratelimit-remaining') || '0', 10)
  const reset = parseInt(response.headers.get('x-ratelimit-reset') || '0', 10)

  if(remaining === 0) {
    const resetDate = new Date(reset * 1000)
    const timeToReset = formatTimeToReset(resetDate)

    throw new Error(`ratelimit of ${ limit } requests exceeded, resets in ${ timeToReset }`)
  }

  return response.json()
}

/**
 * Format time until rate limit reset
 * 
 * @param { Date } resetDate - The date when the rate limit resets
 * 
 * @internal
 * @returns { string } Formatted time string
 */
function formatTimeToReset(resetDate: Date): string {
  const now = new Date()
  const diffMs = resetDate.getTime() - now.getTime()
  
  // Simple implementation of time formatting
  const seconds = Math.floor(diffMs / 1000) % 60
  const minutes = Math.floor(diffMs / (1000 * 60)) % 60
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if(hours > 0) {
    return `${ hours } hour${ hours > 1 ? 's' : '' } ${ minutes } minute${ minutes > 1 ? 's' : '' }`
  } else if(minutes > 0) {
    return `${ minutes } minute${ minutes > 1 ? 's' : '' } ${ seconds } second${ seconds > 1 ? 's' : '' }`
  } else {
    return `${ seconds } second${ seconds > 1 ? 's' : '' }`
  }
}

/**
 * Return tags URL for GitHub API
 * 
 * @param { GithubReleasesOptions } options - Configuration options
 * 
 * @internal
 * @returns { string } The GitHub API URL for tags
 */
function getReleasesUrl(options: GithubReleasesOptions): string {
  return `https://api.github.com/repos/${ options.repo }/tags`
}

/**
 * Return base64 encoded basic auth
 * 
 * @param { GithubReleasesOptions } options - Configuration options with user and pass
 * 
 * @internal
 * @returns { string } Base64 encoded authentication string
 */
function getBasicAuth(options: GithubReleasesOptions): string {
  return Buffer.from(`${ options.user }:${ options.password }`).toString('base64')
}

export default githubReleases