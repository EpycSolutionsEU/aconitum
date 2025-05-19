/**
 * Calculate the number of grapheme clusters in string.
 * 
 * This utility accurately counts the number of user-percieved characters
 * (grapheme clusters) in a string using Intl.Segmenter API. It can
 * optionally include or exclude ANSI ewscape codes from the count.
 * 
 * Unlinke string-width, which measures the isual width of cahracters in 
 * columns, string-length counts each grapheme cluster as one unit regardless
 * of its display width.
 */

import stripAnsi from '../ansi/ansi-strip'

/** Options for the stringLength function. */
export interface StringLengthOptions {
    /**
     * Whether to count ANSI escape codes as part of the string length.
     * Normally, ANSI escape codes are invisible and should not contribute
     * to length.
     * @default false
     */
    countAnsiEscapeCodes?: boolean
}

/**
 * Calculats the number of gapheme clusters in a string
 * 
 * @param { string } string - The string to calculate the length of
 * @param { StringLengthOptions } options - Options for calculating the length
 * 
 * @example
 * ```typescript
 * import stringLength from '@aconitum/utils';
 * 
 * stringLength('abc'); // 3
 * stringLength('你好'); // 2 (counts grapheme clusters, not bytes or code points)
 * stringLength('👨‍👩‍👧‍👦'); // 1 (family emoji is a single grapheme cluster)
 * stringLength('\u001B[31mHello\u001B[0m'); // 5 (ANSI codes don't add to length)
 * ```
 * 
 * @returns { number } The number of grapheme clusters in the string
 */
function stringLength(string: string, options: StringLengthOptions): number {
    if(typeof string !== 'string' || string === '') return 0

    const {
        countAnsiEscapeCodes = false
    } = options

    if(!countAnsiEscapeCodes) {
        string = stripAnsi(string)
        if(string === '') return 0
    }

    // Use Intl.Segmenter to propertly handle grapheme clusters
    const segmenter = new Intl.Segmenter()

    let length = 0
    for(const _ of segmenter.segment(string)) {
        length++
    }

    return length
}


export default stringLength