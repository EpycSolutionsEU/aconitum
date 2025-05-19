/**
 * Options for creating a new GitHub release URL
 */
export interface NewGithubReleaseUrlOptions {
  /** The full repository URL (e.g., 'https://github.com/user/repo') */
  repoUrl?: string

  /** The GitHub username */
  user?: string

  /** The GitHub repository name */
  repo?: string

  /** The git tag to create for this release */
  tag?: string

  /** The target branch or commit SHA */
  target?: string

  /** The title of the release */
  title?: string

  /** The description text for the release */
  body?: string

  /** Whether this is a prerelease */
  isPrerelease?: boolean
}

/**
 * Creates a URL for creating a new GitHub release
 * 
 * @param { NewGithubReleaseUrlOptions } options - Configuration options for the GitHub release URL
 * 
 * @example
 * ```typescript
 * // Using repoUrl
 * const url = newGithubReleaseUrl({ 
 *   repoUrl: 'https://github.com/user/repo',
 *   tag: 'v1.0.0',
 *   title: 'Version 1.0.0'
 * });
 * 
 * // Using user and repo
 * const url = newGithubReleaseUrl({
 *   user: 'user',
 *   repo: 'repo',
 *   tag: 'v1.0.0',
 *   isPrerelease: true
 * });
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { string } The formatted GitHub release URL
 * @throws { Error } Error if neither repoUrl nor both user and repo are provided
 */
function newGithubReleaseUrl(options: NewGithubReleaseUrlOptions = {}): string {
  let repoUrl: string

  if(options.repoUrl) repoUrl = options.repoUrl
  else if(options.user && options.repo) repoUrl = `https://github.com/${ options.user }/${ options.repo }`
  else throw new Error('You need to specify either the `repoUrl` option or both the `user` and `repo` options')

  const url = new URL(`${ repoUrl }/releases/new`)

  const types: Array<keyof NewGithubReleaseUrlOptions> = [
    'tag',
    'target',
    'title',
    'body',
    'isPrerelease',
  ]

  for(let type of types) {
    const value = options[type]
    if(value === undefined) continue

    let paramName = type;
    if(type === 'isPrerelease') {
      paramName = 'prerelease' as keyof NewGithubReleaseUrlOptions
    }

    url.searchParams.set(paramName as string, String(value))
  }

  return url.toString()
}


export default newGithubReleaseUrl