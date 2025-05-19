/** Configuration options for the emoji regex function. */
export type EmojiRegexOptions = {
    /**
     * Match only the first emoji in the string instead of all emojis.
     * When set to true, the regex will not use the global flag.
     * @default false
     */
    readonly onlyFirst?: boolean
}

/**
 * Creates a regular expression for matching Unicode emoji characters.
 * 
 * This regex matche standard emoji chracters based on Unicode 14.0
 * specifications, including:
 * - Basic emoji (e.g., 😀, 👍)
 * - Emoji with skin tone modifiers (e.g., 👋🏽, 👩🏻)
 * - Emoji with gender modifiers (e.g., 👨, 👩)
 * - Emoji sequences with zero-width joiners (e.g., 👨‍💻, 👩‍🔬, 👨‍👩‍👧‍👦)
 * - Emoji with presentation selectors (e.g., ❤️, ☂️)
 * - Regional indicator symbols for flags (e.g., 🇺🇸, 🇯🇵)
 * 
 * The regex uses Unicode property escapes with the 'u' flag for accurate
 * matching across all emoji Unicode ranges. By default, it matches all
 * emojis in a string using the 'g' flag, but this can be configured with
 * options.
 * 
 * @param { EmojiRegexOptions } options - Configuration options for the regex
 * 
 * @remarks
 * Performance note: This regex is optimized for accuracy rather than speed.
 * For processing very large text, consider using it with string chunking.
 * 
 * @example
 * ```typescript
 * import emojiRegex from './emoji';
 *
 * // Basic usage
 * emojiRegex().test('Hello 👋');
 * //=> true
 *
 * emojiRegex().test('No emoji here');
 * //=> false
 *
 * // Matching multiple emojis
 * 'I ❤️ coding with 👨‍💻'.match(emojiRegex());
 * //=> ['❤️', '👨‍💻']
 *
 * // Matching only the first emoji
 * '🎉🎊🎈'.match(emojiRegex({onlyFirst: true}));
 * //=> ['🎉']
 *
 * // Different types of emojis
 * const text = '👩🏽‍💻 works with 👨🏻‍🔬 and 👩‍👧‍👦 on 🇺🇸 project';
 * const emojis = text.match(emojiRegex());
 * //=> ['👩🏽‍💻', '👨🏻‍🔬', '👩‍👧‍👦', '🇺🇸']
 * ```
 * 
 * @returns { RegExp } A RegExp object that matches emoji characters
 */
function emojiRegex(options: EmojiRegexOptions = {}): RegExp {
    // Destructure with default value
    const { onlyFirst = false } = options

    // This pattern matches:
    // 1. Single unicode emoji characters
    // 2. Emoji with modifiers (skin tone, gender, etc.)
    // 3. Emoji sequences with zero-width joiners (ZWJ)
    // 4. Regional indicators for flags
    // Based on Unicode 14.0 emoji specifications
    const pattern = [
        // Basic emoji and emoji with presentation selectors
        // Matches both emoji that are naturally presented as emoji (Emoji_Presentation)
        // and emoji that need a variation selector (\uFE0F) to be presented as emoji
        '(?:\\p{Emoji_Presentation}|\\p{Emoji}\\uFE0F)',

        // Emoji with modifiers
        // Match emoji that can have skin tone modifiers (Emoji_Modifier_Base)
        // optionally followed by a skin tone modifier (Emoji_Modifier)
        '(?:\\p{Emoji_Modifier_Base}\\p{Emoji_Modifier}?)',

        // Regional indicator symbols (flags)
        // Matches pairs of regional indicators which represent country flags
        '(?:\\p{Regional_Indicator}\\p{Regional_Indicator})',

        // Emoji ZWJ sequences
        // Matches complex emoji composed of multiple emoji joined with
        // zero-width joiners (\u200D), like family emoji or professions
        '(?:\\p{Emoji}(?:\\u200D\\p{Emoji})+)'
    ].join('|')

    // Use Unicode property escapes with the 'u' flag for proper Unicode handling
    // The 'g' flag makes it match all occurrences unless onlyFirst is true
    return new RegExp(pattern, `${ onlyFirst ? '' : 'g' }u`)
}


export default emojiRegex