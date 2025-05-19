import ansiRegex from './ansi-regex.js'

/**
 * Strips ANSI escape codes from a string.
 * 
 * ANSI escape codes are special character sequences that control
 * formatting, color, and other output options on video text terminal
 * emulators. These codes start with the escape character 
 * (\u001B or \x1B) followed by specific control sequences.
 * 
 * Common uses for ANSI escape codes include:
 * - Text styling (bold, italic, underline)
 * - Foreground and background colors
 * - Cursor positioning
 * - Screen clearing and scrolling
 * 
 * This function removes all escape sequences from a string, returning
 * only the visible text content. 
 * It's particularly useful when you need to:
 * - Calculate the true length of visible text
 * - Process terminal output for non-terminal display
 * - Clean up text for storage or analysis
 * - Prepare strings for width calculations
 * 
 * @param { string } strip - The string to remove ANSI escaper codes from
 * 
 * @example
 * ```typescript
 * import stripAnsi from '@aconitum/utils';
 * 
 * // Remove styling (underline)
 * stripAnsi('\u001B[4mUnicorn\u001B[0m');
 * // => Unicorn
 * 
 * // Remove multiple styling codes (reset, underline, background, foreground)
 * stripAnsi('\u001B[0m\u001B[4m\u001B[42m\u001B[31mFlying Horse\u001B[39m\u001B[49m\u001B[24m');
 * // => 'Flying Horse'
 * 
 * // Process terminal output for clean display
 * const terminalOutput = '\u001B[1mBold\u001B[0m and \u001B[36mcyan\u001B[0m text';
 * stripAnsi(terminalOutput);
 * // => 'Bold and cyan text'
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { string } A new string with all ANSI escape codes removed.
 * @throws { TypeError } Throws if the input is not a string.
 */
function stripAnsi(strip: string): string {
    if(typeof strip !== 'string') {
        throw new TypeError(`Expected a \`string\`, got \`${ typeof strip }\``)
    }

    // Even through the regex is global, we don't need to reset the `.lastIndex`
    // because unlike `.exec()` and `.test()`, and `.replace()` does it automatically
    // and doing it manually has a performance penalty.
    const regex = ansiRegex()
    return strip.replace(regex, '')
}


export default stripAnsi