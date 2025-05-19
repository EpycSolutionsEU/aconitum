/**
 * East Asian Width utility functions for Unicode characters.
 * 
 * This module provides utilities to determine the display width of Unicode characters
 * based on their East Asian Width property, which is essential for proper text layout
 * in terminals and other monospaced environments.
 */

import { getCategory, isAmbiguous, isFullWidth, isWide } from './lookup.js'

/** Options for the eastAsianWidth function. */
interface EastAsianWidthOptions {
    /**
   * Whether to treat ambiguous-width characters as wide (width 2).
   * In some East Asian contexts, ambiguous characters should be treated as wide.
   * @default false
   */
  ambiguousAsWide?: boolean
}

/** Type representing the possible East Asian Width categories. */
type EastAsianWidthType = 
    | 'ambiguous' 
    | 'fullwidth' 
    | 'halfwidth' 
    | 'narrow' 
    | 'wide' 
    | 'neutral'

/**
 * Validates that the provided coe point is a safe integer.
 * 
 * @param { number } codePoint - The Unicode code point to validate
 * 
 * @since Introduced in v0.1.1
 * @throws { TypeError } If the code point is not a safe integer
 */
function validate(codePoint: number): void {
    if(!Number.isSafeInteger(codePoint)) {
        throw new TypeError(`Expected a code point, got \`${ typeof codePoint }\`.`)
    }
}

/**
 * Gets the East Asian Width category of a Unicode character.
 * 
 * @param { number } codePoint - The Unicode code point to check
 * 
 * @example
 * ```typescript
 * import eastAsianWidthType from '@aconitum/utils';
 * 
 * eastAsianWidthType(0x3000); // 'fullwidth'
 * eastAsianWidthType(0x4E00); // 'wide'
 * eastAsianWidthType(0x0041); // 'narrow'
 * ```
 * 
 * @since Introduced in v0.1.1
 * @returns { EastAsianWidthType } The East Asian Width category of the character
 * @throws { TypeError } If the code point is not a safe integer
 */
function eastAsianWidthType(codePoint: number): EastAsianWidthType {
    validate(codePoint)
    return getCategory(codePoint)
}

/**
 * Gets the diplay width of a Unicode character based on its East Asian Width
 * property.
 * 
 * @param { number } codePoint - The Unicode code point to check
 * @param { EastAsianWidthOptions } options - Options for determining the width
 * 
 * @example
 * ```typescript
 * import eastAsianWidth from '@aconitum/utils';
 * 
 * eastAsianWidth(0x3000); // 2 (fullwidth)
 * eastAsianWidth(0x4E00); // 2 (wide)
 * eastAsianWidth(0x0041); // 1 (narrow)
 * eastAsianWidth(0x2026, { ambiguousAsWide: true }); // 2 (ambiguous treated as wide)
 * ```
 * 
 * @since Introduced in v0.1.1
 * @returns { 1 | 2 } The display width (1 or 2) of the character
 * @throws { TypeError } If the code point is not a safe integer
 */
function eastAsianWidth(codePoint: number, { ambiguousAsWide = false }: EastAsianWidthOptions = {}): 1 | 2 {
    validate(codePoint)

    if(
        isFullWidth(codePoint)
        || isWide(codePoint)
        || (ambiguousAsWide && isAmbiguous(codePoint))
    ) return 2

    return 1
}

/**
 * Checks if a character has a narrow width (not fullwidth or wide).
 * 
 * This is a utility function primarily used by Prettier. It doesn't
 * count "ambiguous" characters and doesn't validate the input.
 * 
 * @param { number } codePoint - The Unicode code point to check
 * 
 * @since Introduced in v0.1.1
 * @returns { boolean } True if the character has narrow width, false otherwise
 * 
 * @internal This is primarily for internal use by Prettier
 */
const _isNarrowWidth = (codePoint: number): boolean =>
    !(isFullWidth(codePoint) || isWide(codePoint))


export type {
    EastAsianWidthOptions,
    EastAsianWidthType
}

export {
    eastAsianWidthType,
    eastAsianWidth,
    
    _isNarrowWidth
}