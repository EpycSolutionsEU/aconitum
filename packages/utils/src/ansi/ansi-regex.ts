export type RegexOptions = {
    /**
     * Match only the first ANSI escape.
     * @default false
     */
    readonly onlyFirst?: boolean
}

/**
 * Regular expression for matching ANSI escape codes in terminal output.
 * 
 * ANSI escape codes are special character sequences that control terminal
 * text formatting, colors, cursor positioning, and other terminal-specific
 * features. This regex pattern matches standard ANSI escape sequences used
 * in terminal applications.
 * 
 * The pattern matches:
 * - CSI (Control Sequence Introducer) sequences starting with '\u001B[' or '\u009B'
 * - SGR (Select Graphic Rendition) parameters for text styling
 * - Cursor moement and positioning commands
 * - Terminal control sequences
 * 
 * @param { RegexOptions } options - Configuration options for the regex
 * 
 * @example
 * ```typescript
 * import ansiRegex from '@aconitum/utils';
 * 
 * ansiRegex().test('\u001B[4mcake\u001B[0m');
 * // => true
 * 
 * ansiRegex().test('cake');
 * // => false
 * 
 * '\u001B[4mcake\u001B[0m'.match(ansiRegex());
 * // => ['\u001B[4m', '\u001B[0m']
 * 
 * '\u001B[4mcake\u001B]0m'.match(ansiRegex({ onlyFirst: true }));
 * // => ['\u001B[4m']
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { RegExp } A RegExp object that matches ANSI escape codes
 */
function ansiRegex(options: RegexOptions = {}): RegExp {
    // Destructure with default value
    const { onlyFirst = false } = options

    // Valid string terminator sequences are BEL, ESC\, and 0x9c
    const ST = '(?:\\u0007|\\u001B\\u005C|\\u009C)'
    const pattern = [
        // Match sequences starting with ESC[ or CSI
        `[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?${ST})`,
        // Match SGR (Select Graphic Rendition) sequences for text styling
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))'
    ].join('|')

    // Return RegExp with global flag unless onlyFirst is true
    return new RegExp(pattern, onlyFirst ? undefined : 'g')
}


export default ansiRegex