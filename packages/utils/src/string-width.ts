/**
 * Calculate the visual width of a string in terminal or monospaced environments.
 * 
 * This utility accurately determines how many columns a string will occupy when displayed
 * in a terminal or monospaced font environment, accounting for:
 * - Full-width characters (like CJK characters)
 * - Emojis (which typically occupy 2 columns)
 * - Special characters and control codes (which may have zero width)
 * - ANSI escape sequences (which are invisible in terminals)
 * 
 * @module string-width
 */

import stripAnsi from './ansi/strip';
import { eastAsianWidth } from './east-asian-width';
import emojiRegex from './regex/emoji';

/**
 * Options for the stringWidth function.
 */
export interface StringWidthOptions {
  /**
   * Whether to treat ambiguous-width characters as narrow (width 1).
   * In some contexts, ambiguous characters should be treated as narrow.
   * @default true
   */
  ambiguousIsNarrow?: boolean;

  /**
   * Whether to count ANSI escape codes as part of the string width.
   * Normally, ANSI escape codes are invisible and should not contribute to width.
   * @default false
   */
  countAnsiEscapeCodes?: boolean;
}

/**
 * Calculates the visual width of a string in terminal or monospaced environments.
 * 
 * @param string - The string to calculate the width of
 * @param options - Options for calculating the width
 * @returns The visual width of the string (number of columns it occupies)
 * 
 * @example
 * ```typescript
 * import stringWidth from './string-width';
 * 
 * stringWidth('abc'); // 3
 * stringWidth('你好'); // 4 (each character is full-width)
 * stringWidth('👋'); // 2 (emoji is double-width)
 * stringWidth('\u001B[31mHello\u001B[0m'); // 5 (ANSI codes don't add width)
 * ```
 */
export default function stringWidth(string: string, options: StringWidthOptions = {}): number {
  if (typeof string !== 'string' || string.length === 0) {
    return 0;
  }

  const {
    ambiguousIsNarrow = true,
    countAnsiEscapeCodes = false,
  } = options;

  if (!countAnsiEscapeCodes) {
    string = stripAnsi(string);
  }

  if (string.length === 0) {
    return 0;
  }

  let width = 0;
  const eastAsianWidthOptions = { ambiguousAsWide: !ambiguousIsNarrow };

  // Use Intl.Segmenter to properly handle grapheme clusters
  const segmenter = new Intl.Segmenter();

  // Regular expression for default ignorable code points
  const defaultIgnorableCodePointRegex = /^\p{Default_Ignorable_Code_Point}$/u;

  for (const { segment: character } of segmenter.segment(string)) {
    const codePoint = character.codePointAt(0);

    // Safety check for undefined codePoint (shouldn't happen with valid strings)
    if (codePoint === undefined) {
      continue;
    }

    // Ignore control characters
    if (codePoint <= 0x1F || (codePoint >= 0x7F && codePoint <= 0x9F)) {
      continue;
    }

    // Ignore zero-width characters
    if (
      (codePoint >= 0x200B && codePoint <= 0x200F) // Zero-width space, non-joiner, joiner, left-to-right mark, right-to-left mark
      || codePoint === 0xFEFF // Zero-width no-break space
    ) {
      continue;
    }

    // Ignore combining characters
    if (
      (codePoint >= 0x300 && codePoint <= 0x36F) // Combining diacritical marks
      || (codePoint >= 0x1AB0 && codePoint <= 0x1AFF) // Combining diacritical marks extended
      || (codePoint >= 0x1DC0 && codePoint <= 0x1DFF) // Combining diacritical marks supplement
      || (codePoint >= 0x20D0 && codePoint <= 0x20FF) // Combining diacritical marks for symbols
      || (codePoint >= 0xFE20 && codePoint <= 0xFE2F) // Combining half marks
    ) {
      continue;
    }

    // Ignore surrogate pairs
    if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
      continue;
    }

    // Ignore variation selectors
    if (codePoint >= 0xFE00 && codePoint <= 0xFE0F) {
      continue;
    }

    // This covers some of the above cases, but we still keep them for performance reasons.
    if (defaultIgnorableCodePointRegex.test(character)) {
      continue;
    }

    // TODO: Use `/\p{RGI_Emoji}/v` when targeting Node.js 20.
    if (emojiRegex().test(character)) {
      width += 2;
      continue;
    }

    width += eastAsianWidth(codePoint, eastAsianWidthOptions);
  }

  return width;
}