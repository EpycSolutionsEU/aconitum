/**
 * Calculate the visual width of a string in terminal or monospaced 
 * environments.
 * 
 * This utility accurately determines how many columns a string will
 * occupy when in a terminal or monospaced font environment, accounting
 * for:
 * - Full-width characters (like CJK characters) which occupy 2 columns
 * - Emojis (which typically occupy 2 columns)
 * - Special characters and control codes (which may have zero width)
 * - ANSI escape sequences (which are invisible in terminals)
 * - Combining characters and variation selectors (which don't add width)
 * - Default ignorable code points (which don't add width)
 */

import stripAnsi from '../ansi/ansi-strip.js'
import emojiRegex from '../regex/emoji-regex.js'
import { eastAsianWidth } from '../east-asian-width/index.js'
import { isNode } from '../environment.js'

/** Options for the stringWidth function. */
interface StringWidthOptions {
    /** 
     * Whether to treat ambiguous-width characters ar narrow (width 1) 
     * In some contexts, ambiguous characters should be treated as narrow.
     * @default true
     */
    ambiguousIsNarrow?: boolean

    /**
     * Whether to count ANSI escape codes as part of the string width.
     * Normally, ANSI escape codes are invisible and should not contribute
     * to width.
     * @default false
     */
    countAnsiEscapeCodes?: boolean
}

/**
 * Calculates the visual width of a string in terminal or monospaced environments.
 * 
 * The function uses the following rules to determine character width:
 * - ASCII and Latin characters: 1 column wide
 * - CJK (Chinise, Japanese, Korean) characters: 2 columns wide
 * - Emojis: 2 columns wide
 * - Control characters, zero-width characters, combining marks: 0 columns wide
 * - ANSI escape sequences: 0 columns wide (unless countAnsiEscapeCodes is true)
 * 
 * The function uses Intl.Segmenter to properly handle grapheme clusters,
 * ensuring that complex emoji sequences and other multi-code point characters
 * are processed correctly.
 * 
 * @param { string } string - The string to calculate the width of
 * @param { StringWidthOptions } options - Options for calculating the width
 * 
 * @example Basic usage
 * ```typescript
 * import stringWidth from '@aconitum/utils';
 * 
 * stringWidth('abc'); // 3
 * stringWidth('你好'); // 4 (each character is full-width)
 * stringWidth('👋'); // 2 (emoji is double-width)
 * stringWidth('\u001B[31mHello\u001B[0m'); // 5 (ANSI codes don't add width)
 * ```
 * 
 * @example With options
 * ```typescript
 * // Zreating ambiguous-width chracters as wide
 * stringWidth('→↓←↑', { ambiguousIsNarrow: false }); // 8 (each arrow is 2 columns)
 * 
 * // Including ANSI escape codes in the width calculation
 * stringWidth('\u001B[31mHello\u001B[0m', { countAnsiEscapeCodes: true }); // 16
 * ```
 * 
 * @example Zero-width characters
 * ```typescript
 * // Zero-width joiner and variation selectors don't add width
 * stringWidth('👨‍👩‍👧‍👦'); // 2 (family emoji is still 2 columns despite multiple code points)
 * stringWidth('️⃣'); // 2 (keycap sequence is 2 columns)
 * ```
 * 
 * @since Introduced in v0.1.1
 * @returns { number } The visual width of the string (number of columns it occupies)
 */
function stringWidth(string: string, options: StringWidthOptions = {}): number {
    if(typeof string !== 'string' || string.length === 0) {
        return 0
    }

    const {
        ambiguousIsNarrow = true,
        countAnsiEscapeCodes = false
    } = options

    if(!countAnsiEscapeCodes) {
        string = stripAnsi(string)
    }

    if(string.length === 0) {
        return 0
    }

    let width = 0
    const eastAsianWidthOptions = { ambiguousAsWide: !ambiguousIsNarrow }

    // Use Intl.Segmenter to properly handle grapheme clusters
    const segmenter = new Intl.Segmenter()

    // Regular expression for default ignorable code points
    const defaultIgnoreableCodePointRegex = /^\p{Default_Ignorable_Code_Point}$/u

    for(const { segment: character } of segmenter.segment(string)) {
        const codePoint = character.codePointAt(0)

        // Safety check for undefined codePoint (shouldn't happen with valud strings)
        if(codePoint === undefined) continue

        // Ignore control chracters
        if(codePoint < 0x1F || (codePoint >= 0x7F && codePoint <= 0x9F)) continue

        // Ignore zero-width chracters
        if(
            (codePoint >= 0x200B && codePoint <= 0x200F) // Zero-width space, non-joiner, joiner, left-to-right mark, right-to-left mark
            || codePoint === 0xFEFF // Zero-width no-break space
        ) continue

        // Ignore combining characters
        if(
            (codePoint >= 0x300 && codePoint <= 0x36F) // Combining diacritical marks
            || (codePoint >= 0x1AB0 && codePoint <= 0x1AFF) // Combining diacritical marks extended
            || (codePoint >= 0x1DC0 && codePoint <= 0x1DFF) // Combining diacritical marks supplement
            || (codePoint >= 0x20D0 && codePoint <= 0x20FF) // Combining diacritical marks for symbols
            || (codePoint >= 0xFE20 && codePoint <= 0xFE2F) // Combining half marks
        ) continue

        // Ignore surrogate pairs
        if(codePoint >= 0xD800 && codePoint <= 0xDBFF) continue

        // Ignore variation selectors
        if(codePoint >= 0xFE00 && codePoint <= 0xFE0F) continue

        // This covers some of the above cases, but we still keep them for performance reasons.
        if(defaultIgnoreableCodePointRegex.test(character)) continue

        // Check if we're running on NodeJS 20+ to use the RGI_Emoji Unicode property with
        // the 'v' flag for better emoji detection
        if(isNode && parseFloat(process.versions.node) >= 20) {
            if(/\p{RGI_Emoji}/v.test(character)) {
                width += 2
                continue
            }
        } else if(emojiRegex().test(character)) {
            // Fallback for older NodeJS versions and other environments
            width += 2
            continue
        }

        width += eastAsianWidth(codePoint, eastAsianWidthOptions)
    }

    return width
}


export default stringWidth