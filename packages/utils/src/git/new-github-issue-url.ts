/** Options for creating a new GitHub issue URL */
export interface NewGithubIssueUrlOptions {
  /** The full repository URL (e.g., 'https://github.com/user/repo') */
  repoUrl?: string

  /** The GitHub username */
  user?: string

  /** The GitHub repository name */
  repo?: string

  /** The body/description of the issue */
  body?: string

  /** The title of the issue */
  title?: string

  /** The labels to apply to the issue (comma-separated or array) */
  labels?: string | string[]

  /** The issue template to use */
  template?: string

  /** The milestone to assign to the issue */
  milestone?: string | number

  /** The GitHub username to assign the issue to */
  assignee?: string

  /** The projects to add this issue to (comma-separated or array) */
  projects?: string | string[]

  /** The type of issue (e.g., 'bug', 'feature', etc.) */
  type?: string
}

/**
 * Creates a URL for creating a new GitHub issue
 * 
 * @param { NewGithubIssueUrlOptions } options - Configuration options for the GitHub issue URL
 * 
 * @example
 * ```typescript
 * // Using repoUrl
 * const url = newGithubIssueUrl({ 
 *   repoUrl: 'https://github.com/user/repo',
 *   title: 'Bug report',
 *   body: 'I found a bug'
 * });
 * 
 * // Using user and repo
 * const url = newGithubIssueUrl({
 *   user: 'user',
 *   repo: 'repo',
 *   title: 'Feature request',
 *   labels: ['enhancement', 'help wanted']
 * });
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { string } The formatted GitHub issue URL
 * @throws { Error } Error if neither repoUrl nor both user and repo are provided
 */
function newGithubIssueUrl(options: NewGithubIssueUrlOptions = {}): string {
  let repoUrl: string

  if(options.repoUrl) repoUrl = options.repoUrl
  else if(options.user && options.repo) repoUrl = `https://github.com/${ options.user }/${ options.repo }`
  else throw new Error('You need to specify either the `repoUrl` option or both the `user` and `repo` options')

  const url = new URL(`${ repoUrl }/issues/new`)

  // Process labels if provided
  if(options.labels) {
    const labels = Array.isArray(options.labels) ? options.labels.join(',') : options.labels
    url.searchParams.set('labels', labels)
  }

  // Process projects if provided
  if(options.projects) {
    const projects = Array.isArray(options.projects) ? options.projects.join(',') : options.projects
    url.searchParams.set('projects', projects)
  }

  // Process other parameters
  const paramMap: Record<string, keyof NewGithubIssueUrlOptions> = {
    'template': 'template',
    'title': 'title',
    'body': 'body',
    'milestone': 'milestone',
    'assignee': 'assignee',
    'type': 'type'
  }

  for(const [paramName, optionKey] of Object.entries(paramMap)) {
    const value = options[optionKey]
    if(value !== undefined) {
      url.searchParams.set(paramName, String(value))
    }
  }

  return url.toString()
}


export default newGithubIssueUrl