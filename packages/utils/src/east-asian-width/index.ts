/**
 * East Asian Width utility functions for Unicode characters.
 * 
 * This module provides utilities to determine the display width of Unicode characters
 * based on their East Asian Width property, which is essential for proper text layout
 * in terminals and other monospaced environments.
 * 
 * @module east-asian-width
 */

import { getCategory, isAmbiguous, isFullWidth, isWide } from './lookup';

/**
 * Options for the eastAsianWidth function.
 */
export interface EastAsianWidthOptions {
  /**
   * Whether to treat ambiguous-width characters as wide (width 2).
   * In some East Asian contexts, ambiguous characters should be treated as wide.
   * @default false
   */
  ambiguousAsWide?: boolean;
}

/**
 * Type representing the possible East Asian Width categories.
 */
export type EastAsianWidthType = 'ambiguous' | 'fullwidth' | 'halfwidth' | 'narrow' | 'wide' | 'neutral';

/**
 * Validates that the provided code point is a safe integer.
 * 
 * @param codePoint - The Unicode code point to validate
 * @throws {TypeError} If the code point is not a safe integer
 */
function validate(codePoint: number): void {
	if (!Number.isSafeInteger(codePoint)) {
		throw new TypeError(`Expected a code point, got \`${typeof codePoint}\`.`);
	}
}

/**
 * Gets the East Asian Width category of a Unicode character.
 * 
 * @param codePoint - The Unicode code point to check
 * @returns The East Asian Width category of the character
 * @throws {TypeError} If the code point is not a safe integer
 * 
 * @example
 * ```typescript
 * eastAsianWidthType(0x3000); // 'fullwidth'
 * eastAsianWidthType(0x4E00); // 'wide'
 * eastAsianWidthType(0x0041); // 'narrow'
 * ```
 */
export function eastAsianWidthType(codePoint: number): EastAsianWidthType {
	validate(codePoint);

	return getCategory(codePoint);
}

/**
 * Gets the display width of a Unicode character based on its East Asian Width property.
 * 
 * Characters are assigned a width of either 1 (narrow) or 2 (wide) columns,
 * which is useful for determining text layout in terminals and other monospaced environments.
 * 
 * @param codePoint - The Unicode code point to check
 * @param options - Options for determining the width
 * @returns The display width (1 or 2) of the character
 * @throws {TypeError} If the code point is not a safe integer
 * 
 * @example
 * ```typescript
 * eastAsianWidth(0x3000); // 2 (fullwidth)
 * eastAsianWidth(0x4E00); // 2 (wide)
 * eastAsianWidth(0x0041); // 1 (narrow)
 * eastAsianWidth(0x2026, { ambiguousAsWide: true }); // 2 (ambiguous treated as wide)
 * ```
 */
export function eastAsianWidth(codePoint: number, { ambiguousAsWide = false }: EastAsianWidthOptions = {}): 1 | 2 {
	validate(codePoint);

	if (
		isFullWidth(codePoint)
		|| isWide(codePoint)
		|| (ambiguousAsWide && isAmbiguous(codePoint))
	) {
		return 2;
	}

	return 1;
}

/**
 * Checks if a character has a narrow width (not fullwidth or wide).
 * 
 * This is a utility function primarily used by Prettier. It doesn't count "ambiguous" 
 * characters and doesn't validate the input.
 * 
 * @param codePoint - The Unicode code point to check
 * @returns True if the character has narrow width, false otherwise
 * 
 * @see https://github.com/sindresorhus/get-east-asian-width/pull/6
 * @internal This is primarily for internal use by Prettier
 */
export const _isNarrowWidth = (codePoint: number): boolean => 
	!(isFullWidth(codePoint) || isWide(codePoint));