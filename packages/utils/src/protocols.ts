/**
 * Extracts and returns the protocol(s) from a given URL.
 * 
 * This function parses the input URL and extracts its protocol(s).
 * URLs can have multiple protocols (e.g., 'git+https://example.com'), which
 * will be returned as an array.
 * Optionally, you can request only a specific protocol from the array.
 * 
 * @param { string | URL } input - The input URL to extract protocols from. Can
 *                                 be a string URL or a URL object.
 * @param { boolean | number } [first] - Optional parameter to specify which protocol to return:
 *                                       - If `true`, only the first protocol will be returned (equivalent to index 0)
 *                                       - If a number, returns the protocol at that index (zero-based)
 *                                       - If omitted, returns all protocols as an array
 * 
 * @example
 * ```typescript
 * // Returns ['https']
 * protocols('https://example.com');
 * 
 * // Returns ['git', 'https']
 * protocols('git+https://github.com/user/repo');
 * 
 * // Returns 'git'
 * protocols('git+https://github.com/user/repo', true);
 * 
 * // Returns 'https'
 * protocols('git+https://github.com/user/repo, 1);
 * ```
 * 
 * @since Introduced in v0.1.0
 * @returns { string | string[] } The extracted protocol(s):
 *                                - A string if a specific protocol was requested via the 'first' parameter
 *                                - An array of strings (all protocols) if no specific protocol was requested
 *                                - An empty array if no protocols were found or the URL is invalid
 */
function protocols(input: string | URL, first?: boolean | number): string | string[] {
    if(first === true) first = 0
    let protocols = ''

    if(typeof input === 'string') {
        try {
            protocols = new URL(input).protocol
        } catch (error) { /* Invalid URL, protocols remains an empty string. */ }
    } else if(input instanceof URL) {
        protocols = input.protocol
    }

    const splits = protocols.split(/:|\+/).filter(Boolean)

    if(typeof first === 'number') return splits[first]
    return splits
}

export default protocols