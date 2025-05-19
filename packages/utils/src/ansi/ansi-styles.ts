/**
 * ANSI styles module for terminal text styling and coloring.
 * 
 * This module provides utilities for working with ANSI escape sequences
 * to syle and color text in terminal environments. It includes function
 * for converting between different color formats (RGB, Hex, ANSI) and
 * provides a comprehensive set of style definitions.
 */

/**
 * ANSI background color offset constant used for background color
 * calculations. This value is added to foreground color coes to get 
 * the corresponding background color code.
 */
const ANSI_BACKGROUND_OFFSET = 10

/**
 * Creates a function that wraps a color code in ANSI 16 color format.
 * 
 * @param offset - Optional offset for background colors
 * @returns { string } A function that accepts a code and returns an 
 *                     ANSI escape sequence
 */
const wrapAnsi16 = (offset = 0) => (code: number): string => 
        `\u001B[${ code + offset }m`

/**
 * Creates a function that wraps a color code in ANSI 256 color format.
 * 
 * @param offset - Optional offset for background colors
 * @returns { string } A function that accepts a code and returns an
 *                     ANSI escape sequence
 */
const wrapAnsi256 = (offset = 0) => (code: number): string =>
        `\u001B[${ 38 +offset };5;${ code }m`

/**
 * Createx a function that wraps RGB values in ANSI 16 million color format.
 * 
 * @param offset - Optional offset for background colors
 * @returns { string } A function that accepts RGB values and returns 
 *                     an ANSI escape sequence
 */
const wrapAnsi16m = (offset = 0) => (red: number, green: number, blue: number): string =>
        `u001B[${ 38 + offset };2;${ red };${ green };${ blue }m`


/**
 * Interface for style modifiers like bold, italic, etc.
 * 
 * Each property is a tuple of two number:
 * - The first number is the ANSI code to enable the style
 * - The second number is the ANSI code to disable the style
 * 
 * @example
 * ```typescript
 * // The bold style is enabled with code 1 and disabled wiuth code 22
 * bold: [1, 22]
 * ```
 */
interface StyleModifier {
    reset:          [number, number]
    bold:           [number, number]
    dim:            [number, number]
    italic:         [number, number]
    underline:      [number, number]
    overline:       [number, number]
    inverse:        [number, number]
    hidden:         [number, number]
    strikethrough:  [number, number]
}

/**
 * Interface for foreground colors.
 * 
 * Each property is a tuple of two numbers:
 * - The first number is the ANSI code to set the foreground color
 * - The second number is the ANSI code to reset the foreground color (usually 39)
 * 
 * @example
 * ```typescript
 * // The red color is set with code 31 and reset with code 39
 * red: [31, 39]
 * ```
 */
interface ColorStyles {
    black:          [number, number]
	red:            [number, number]
	green:          [number, number]
	yellow:         [number, number]
	blue:           [number, number]
	magenta:        [number, number]
	cyan:           [number, number]
	white:          [number, number]
	blackBright:    [number, number]
	gray:           [number, number]
	grey:           [number, number]
	redBright:      [number, number]
	greenBright:    [number, number]
	yellowBright:   [number, number]
	blueBright:     [number, number]
	magentaBright:  [number, number]
	cyanBright:     [number, number]
	whiteBright:    [number, number]
}

/**
 * Interface for background colors.
 * 
 * Each property is a tuple of two numbers:
 * - The first number is the ANSI code to set the background color
 * - The second number is the ANSI code to reset the background color (usually 49)
 * 
 * @example
 * ```typescript
 * // The red background is set with code 41 and reset with code 49
 * bgRed: [41, 49]
 * ```
 */
interface BackgroundColorStyles {
    bgBlack:          [number, number]
	bgRed:            [number, number]
	bgGreen:          [number, number]
	bgYellow:         [number, number]
	bgBlue:           [number, number]
	bgMagenta:        [number, number]
	bgCyan:           [number, number]
	bgWhite:          [number, number]
	bgBlackBright:    [number, number]
	bgGray:           [number, number]
	bgGrey:           [number, number]
	bgRedBright:      [number, number]
	bgGreenBright:    [number, number]
	bgYellowBright:   [number, number]
	bgBlueBright:     [number, number]
	bgMagentaBright:  [number, number]
	bgCyanBright:     [number, number]
	bgWhiteBright:    [number, number]
}

/**
 * Interface for style definitions with open and close sequences.
 * 
 * Each style has an opening ANSI sequence to enable the style and a
 * closing sequence to disable it.
 * 
 * @example
 * ```typescript
 * // The red color style
 * red: {
 *   open: '\u001B[31m',  // Enables red color
 *   close: '\u001B[39m'  // Resets to default color
 * }
 * ```
 */
interface StyleDefinition {
    open: string
    close: string
}

/**
 * Interface for the ANSI styles object that provides all styling
 * functionality.
 * 
 * This comprehensive interface includes:
 * - Style modifiers (bold, italic, etc.)
 * - Foreground colors (red, green, etc.)
 * - Background colors (bgRed, bgGreen, etc.)
 * - Color conversion utilities (RGB to ANSI, HEX to RGB, etc.)
 * 
 * @example
 * ```typescript
 * // Using foreground color
 * console.log(ansiStyles.color.red.open + 'This is red text' + ansiStyles.color.red.close);
 * 
 * // Using a style modifier
 * console.log(ansiStyles.modifier.bold.open + 'This is bild text' + ansiStyles.modifier.bold.close);
 * 
 * // Using color conersion
 * const ansiCode = ansiStyles.hexToAnsi('#FF0000'); // Convert hex red to ANSI code
 * ```
 */
interface AnsiStyles {
    modifier: Record<keyof StyleModifier, StyleDefinition>

    color: Record<keyof ColorStyles, StyleDefinition> & {
        ansi: (code: number) => string
        ansi256: (code: number) => string
        ansi16m: (red: number, green: number, blue: number) => string

        close: string
    }

    backgroundColor: Record<keyof BackgroundColorStyles, StyleDefinition> & {
        ansi: (code: number) => string
        ansi256: (code: number) => string
        ansi16m: (red: number, green: number, blue: number) => string

        close: string
    }

    rgbToAnsi256: (red: number, green: number, blue: number) => number

    hexToRGB: (hex: string | number) => [number, number, number]
    hexToAnsi256: (hex: string | number) => number

    ansi256ToAnsi: (code: number) => number
    rgbToAnsi: (red: number, green: number, blue: number) => number
    hexToAnsi: (hex: string | number) => number

    codes: Map<number, number>

    [key: string]: any
}

/**
 * Initial style definitions with ANSI coor codes for all supported
 * styles.
 * 
 * This object contains three main categories:
 * - modifier: Text style modifiers like bold, italic, etc.
 * - color: Foreground colors (standard and bright variants)
 * - backgroundColor: Background colors (standard and bright variants)
 * 
 * Each style is defined as a tuple of [enableCode, disableCode].
 */
const styles: {
    modifier: StyleModifier
    color: ColorStyles
    backgroundColor: BackgroundColorStyles
    [key: string]: any
} = {
    modifier: {
        reset:          [0,0],

        // 21 isn't widely supported and 22 does the same thing
        bold:           [1, 22],
        dim:            [2, 22],
        italic:         [3, 23],
        underline:      [4, 24],
        overline:       [53, 55],
        inverse:        [7, 27],
        hidden:         [8, 28],
        strikethrough:  [9, 29]
    },

    color: {
        black:          [30, 39],
        red:            [31, 39],
        green:          [32, 39],
        yellow:         [33, 39],
        blue:           [34, 39],
        magenta:        [35, 39],
        cyan:           [36, 39],
        white:          [37, 39],

        // Bright color
        blackBright:    [90, 39],
        gray:           [90, 39], // Alias of `blackBright`
        grey:           [90, 39], // Alias of `blackBright`
        redBright:      [91, 39],
        greenBright:    [92, 39],
        yellowBright:   [93, 39],
        blueBright:     [94, 39],
        magentaBright:  [95, 39],
        cyanBright:     [96, 39],
        whiteBright:    [97, 39]
    },

    backgroundColor: {
        bgBlack:            [40, 49],
		bgRed:              [41, 49],
		bgGreen:            [42, 49],
		bgYellow:           [43, 49],
		bgBlue:             [44, 49],
		bgMagenta:          [45, 49],
		bgCyan:             [46, 49],
		bgWhite:            [47, 49],

		// Bright color
		bgBlackBright:      [100, 49],
		bgGray:             [100, 49], // Alias of `bgBlackBright`
		bgGrey:             [100, 49], // Alias of `bgBlackBright`
		bgRedBright:        [101, 49],
		bgGreenBright:      [102, 49],
		bgYellowBright:     [103, 49],
		bgBlueBright:       [104, 49],
		bgMagentaBright:    [105, 49],
		bgCyanBright:       [106, 49],
		bgWhiteBright:      [107, 49],
    }
}

/**
 * Export the names of all modifiers for external use.
 * 
 * This array contains all available text style modifier names like 'bold',
 * 'italic', etc.
 * 
 * @example
 * ```typescript
 * // Check if a style is a modifier
 * const isModifier = modifierNames.includes('bold');   // true
 * ```
 */
export const modifierNames = Object.keys(styles.modifier) as Array<keyof StyleModifier>

/**
 * Export the names of all foreground colors for external use.
 * 
 * This array contains all available foreground color names like 'red',
 * 'blue', 'greenBright', etc.
 * 
 * @example
 * ```typescript
 * // Check if a style is a foreground color
 * const isColor = foregroundColorNames.includes('red'); // true
 * ```
 */
export const foregroundColorNames = Object.keys(styles.color) as Array<keyof ColorStyles>

/**
 * Export the names of all background colors for external use.
 * 
 * This array contains all available background color names like 'bgRed',
 * 'bgBlue', 'bgGreenBright', etc.
 * 
 * @example
 * ```typescript
 * // Check if a style is a background color
 * const isColor = backgroundColorNames.includes('red'); // true
 * ```
 */
export const backgroundColorNames = Object.keys(styles.backgroundColor) as Array<keyof BackgroundColorStyles>

/**
 * Export all color names (foreground and background) for external use.
 * 
 * This array combines both, foregroundColorNames and backgroundColorNames
 * for convenience.
 * 
 * @example
 * ```typescript
 * // Check if a name is any type of color (foreground or background)
 * const isAnyColor = colorNames.includes('red') || colorNames.includes('bgRed');
 * ```
 */
export const colorNames = [...foregroundColorNames, ...backgroundColorNames]

/**
 * Assembles the styles object with all ANSI color codes and utility functions.
 * 
 * This function transforms the raw style definitions into a complete AnsiStyles
 * with open/close sequences and all utility methods for color conversion.
 * 
 * The function performs the following oprations:
 * 1. Converts raw stxyle codes to ANSI escape sequences
 * 2. Sets up color utility methods (ansi, ansi256, ansi16m)
 * 3. Adds color conversion utilities (rgbToAnsi256, hexToRGB, etc.)
 * 
 * @returns { AnsiStyles } The fully assembled ANSI styles object with all styling capabilities
 */
function assembleStyles(): AnsiStyles {
    const codes = new Map<number, number>()
    const result = styles as unknown as AnsiStyles

    for(const [groupName, group] of Object.entries(styles)) {
        for(const [styleName, style] of Object.entries(group)) {
            styles[styleName] = {
                open: `\u001B[${ (style as [number, number])[0] }m`,
                close: `\u001B[${ (style as [number, number])[1] }m`
            }

            group[styleName] = styles[styleName]

            codes.set((style as [number, number])[0], (style as [number, number])[1])
        }

        Object.defineProperty(result, groupName, {
            value: group,
            enumerable: false
        })
    }

    Object.defineProperty(result, 'codes', {
        value: codes,
        enumerable: false
    })

    result.color.close = '\u001B[39m'
    result.backgroundColor.close = '\u001B[49m'

    result.color.ansi = wrapAnsi16()
    result.color.ansi256 = wrapAnsi256()
    result.color.ansi16m = wrapAnsi16m()

    result.backgroundColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET)
    result.backgroundColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET)
    result.backgroundColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET)


    Object.defineProperties(styles, {
        /**
         * Converts RGB color values to an ANSI 256 color code.
         * 
         * This function maps RGB values (0-255) to the closest color in the 
         * 256-color ANSI palette. It handles both grayscales colors (when R=G=B)
         * and regular colors using different algorithms.
         * 
         * @param { number } red - Red component (0-255)
         * @param { number } green - Green component (0-255)
         * @param { number } blue - Blue component (0-255)
         * 
         * @example
         * ```typescript
         * // Convert pure red to ANSI 256
         * const ansi256Code = rgbToAnsi256(255, 0, 0); // Returns 196
         * ```
         * 
         * @returns { number } The closest ANSI 256 color code (16-255)
         */
        rgbToAnsi256: {
            value(red: number, green: number, blue: number): number {
                // We use the extended greyscale palette here, with the exception of
                // black and white. normal palette only has 4 greyscale shades.
                if(red === green && green === blue) {
                    if(red < 8) return 16
                    if(red > 248) return 231

                    return Math.round(((red - 8) / 247) * 24) + 232
                }

                return 16
                    + (36 * Math.round(red / 255 * 5))
                    + (6 * Math.round(green / 255 * 5))
                    + Math.round(blue / 255 * 5)
            },
            enumerable: false
        },

        /**
         * Converts a hexadecimal color value to RGB components.
         * 
         * This function accepts hex colors in the following formats:
         * - 6-digit hex: '#FF0000' or 'FF0000' or 0xFF0000
         * - 3-digit hex: '#F00' or 'F00' or 0xF00
         * 
         * @param { string | number } hex - Hex color value as a string (with or without #) or number
         * 
         * @example
         * ```typescript
         * // Convert hex red to RGB
         * const [r, g, b] = hexToRGB('#FF0000');   // Returns [255, 0, 0]
         * 
         * // Short hex notation
         * const [r, g, b] = hexToRGB('#F00');      // Also returns [255, 0, 0]
         * 
         * // Numeric hex
         * const [r, g, b] = hexToRGB(0xFF0000);    // Also returns [255, 0, 0]
         * ```
         * 
         * @returns { [number, number, number] } An array of [red, green, blue] components (0-255)
         */
        hexToRGB:  {
            value(hex: string | number): [number, number, number] {
                const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16))
                if(!matches) return [0, 0, 0]

                let [ colorString ] = matches
                if(colorString.length === 3) {
                    colorString = colorString.split('').map((character) => character + character).join('')
                }

                const integer = Number.parseInt(colorString, 16)

                return [
                    (integer >> 16) & 0xFF,
                    (integer >> 8) & 0xFF,
                    integer & 0xFF
                ]
            },
            enumerable: false
        },

        /**
         * Converts a hex color value to ANSI 256 color code.
         * 
         * This function combines hexToRGB and rgbToAnsi256 to directly concert
         * a hex color to the closest ANSI 256 color code.
         * 
         * @param { string | number } hex - Hex color value as a string (with or without #)
         *                                  or number
         * 
         * @example
         * ```typescript
         * // Convert hex red to ANSI 256
         * const ansi256Code = hexToAnsi256('#FF0000'); // Returns 196
         * 
         * // Using numeric hex
         * const ansi256Code = hexToAnsi256(0x00FF00);  // Returns 46 (green)
         * ```
         * 
         * @returns { number } The closest ANSI 256 color code (16-255)
         */
        hexToAnsi256: {
            value: (hex: string | number): number => styles.rgbToAnsi256(...styles.hexToRGB(hex)),
            enumerable: false
        },

        /**
         * Converts ANSI 256 color code to ANSI 16 color code.
         * 
         * This function maps a color from the 256-color palette to the closest
         * color in the 16-color palette. It handles standard colors (0-15),
         * grayscale colors (232-255), and the 6x6x6 color cube (16-231).
         * 
         * @param { number } code - Ansi 256 color code (0-255)
         * 
         * @example
         * ```typescript
         * // Conert ANSI 256 red to ANSI 16
         * const ansi16Code = ansi256ToAnsi(196);   // Returns 91 (bright red)
         * 
         * // Convert ANSI 256 blue to ANSI 16
         * const ansi16Code = ansi256ToAnsi(21);    // Returns 34 (blue)
         * ```
         * 
         * @returns { number } ANSI 16 color code (30-37 for standard, 90-97 for bright)
         */
        ansi256ToAnsi: {
            value(code: number): number {
                if(code < 8) return 30 + code
                if(code < 16) return 90 + (code - 8)

                let red: number
                let green: number
                let blue: number

                if(code >= 232) {
                    red = (((code - 232) * 10) + 8) / 255
                    green = red
                    blue = red
                } else {
                    code -= 16

                    const remainder = code % 36

                    red = Math.floor(code / 36) / 5
                    green = Math.floor(remainder / 6) / 5
                    blue = (remainder % 6) / 5
                }

                const value = Math.max(red, green, blue) * 2
                if(value === 0) return 30

                let result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red))
                if(value === 2) result += 60

                return result
            },
            enumerable: false
        },

        /**
         * Converts RGB value directly to ANSI 16 color code.
         * 
         * This function combines rgbToAnsi256 and ansi256ToAnsi to directly
         * conert RGB color values to the closest ANSI 16 color code. This is
         * useful when targeting terminals with limited color support.
         * 
         * @param { number } red - Red component (0-255)
         * @param { number } green - Green component (0-255)
         * @param { number } blue - Blue component (0-255)
         * 
         * @example
         * ```typescript
         * // Convert RGB red to ANSI 16
         * const ansi16Code = rgbToAnsi(255, 0, 0); // Returns 91 (bright red)
         * 
         * // Convert RGB blue to ANSI 16
         * const ansi16Code = rgbToAnsi(0, 0, 255); // Returns 94 (bright blue)
         * ```
         * 
         * @returns { number } ANSI 16 color code (30-37 for standard, 90-97 for bright)
         */
        rgbToAnsi: {
            value: (red: number, green: number, blue: number): number =>
                styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
            enumerable: false
        },

        /**
         * Converts a hex color value directly to ANSI 16 color code.
         * 
         * This function combines hexToAnsi256 and ansi256ToAnsi to directly convert
         * a hex color to the closest ANSI 16 color code. This is the most direct way
         * to get a terminal-comatible color code from a hex color value when targeting
         * terminals with limited color support.
         * 
         * @param { string | number } hex - Hex color value as a string (with or without #)
         *                                  or number
         * 
         * @example
         * ```typescript
         * // Convert hex red to ANSI 16
		 * const ansi16Code = hexToAnsi('#ff0000'); // Returns 91 (bright red)
		 * 
		 * // Convert hex blue to ANSI 16
		 * const ansi16Code = hexToAnsi('#0000ff'); // Returns 94 (bright blue)
		 * 
		 * // Using numeric hex
		 * const ansi16Code = hexToAnsi(0x00ff00); // Returns 92 (bright green)
         * ```
         * 
         * @returns { number } ANSI 16 color code (30-37 for standard, 90-97 for bright)
         */
        hexToAnsi: {
            value: (hex: string | number): number =>
                styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
            enumerable: false
        }
    })

    return result
}

/**
 * The fully assembled ANSI styles object with all color codes and utility
 * functions.
 * 
 * This is the main export of the module and provides access to all ANSI
 * styling capabilities:
 * - Text modifiers (bold, italic, underline, etc.)
 * - Foreground colors (standard and bright variants)
 * - Background colors (standard and bright variants)
 * - Color conversion utilities
 * 
 * @example
 * ```typescript
 * import ansiStyles from '@aconitum/utils';
 * 
 * // Style text with foreground color
 * console.log(ansiStyles.color.red.open + 'Error!' + ansiStyles.color.red.close);
 * 
 * // Combine styles
 * console.log(
 *   ansiStyles.color.yellow.open +
 *   ansiStyles.modifier.bold.open +
 *   'Warning!' +
 *   ansiStyles.modifier.bold.close +
 *   ansiStyles.color.yellow.close
 * );
 * 
 * // Convert colors
 * const ansiCode = ansiStyles.hexToAnsi('#3498DB');
 * ```
 * 
 * @since Introduced in v0.2.0
 */
const ansiStyles = assembleStyles()


export default ansiStyles