import process from 'node:process'
import { isBrowser } from '../environment.js'

/** ANSI escape code constants used for terminal control sequences. */
const ESC = '\u001B['
const OSC = '\u001B]'
const BEL = '\u0007'
const SEP = ';'

/** Environment detection flags for terminal-specific behavior */
const isTerminalApp = !isBrowser && process.env.TERM_PROGRAM === 'Apple_Terminal'
const isWindows = !isBrowser && process.platform === 'win32'

/**
 * Function to get the current working directory, with browser
 * comptaibility check.
 */
const cwdFunction = isBrowser ? (): string => {
    throw new Error('`process.cwd()` only works in NodeJS, not the browser.')
} : process.cwd

/**
 * Moves the cursor to a specific position.
 * 
 * @param { number } x - The column to move to (0-based index)
 * @param { number } y - The row to move to (0-based index)
 * 
 * @example
 * ```typescript
 * // Move cursor to column 5
 * process.stdout.write(cursorTo(5));
 * 
 * // Move cursor to row 10, column 5
 * process.stdout.write(cursorTo(5, 10));
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { string } The ANSI escapes sequence for cursor positioning
 * @throws { TypeError } If x is not a number
 */
const cursorTo = (x: number, y?: number): string => {
    if(typeof x !== 'number') {
        throw new TypeError('The `x` argument is required.')
    }

    if(typeof y !== 'number') {
        return ESC + (x + 1) + 'G'
    }

    return ESC + (y + 1) + SEP + (x + 1) + 'H'
}

/**
 * Moves the cursor relative to its current position.
 * 
 * @param { number } x - The number of columns to move horizontally
 *                       (nagative for left, positive for right)
 * @param { number } y - The number of rows to move vertically
 *                       (negative for up, positive for down)
 *
 * @example
 * ```typescript
 * // Move cursor 3 columns right and 2 rows down
 * process.stdout.write(cursorMove(3, 2));
 *
 * // Move cursor 5 columns left
 * process.stdout.write(cursorMove(-5, 0));
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns { string } The ANSI escape sequence for cursor environment
 * @throws { TypeError } If x is not a number
 */
const cursorMove = (x: number, y: number): string => {
    if(typeof x !== 'number') {
        throw new TypeError('The `x` argument is required.')
    }

    let returnValue = ''

    if(x < 0) {
        returnValue += ESC + (-x) + 'D'
    } else if(x > 0) {
        returnValue += ESC + x + 'C'
    }

    if(y < 0) {
        returnValue += ESC + (-y) + 'A'
    } else if(y > 0) {
        returnValue += ESC + y + 'B'
    }

    return returnValue
}

/**
 * Moves the cursor up by the specified count.
 * 
 * @param { number } count - Number of rows to move up (default: 1)
 * 
 * @since Introduced in v0.2.0
 * @returns { string } The ANSI escape sequence for moving cursor up
 */
const cursorUp = (count: number = 1): string => ESC + count + 'A'

/**
 * Moves the cursor down by the specified count.
 * 
 * @param { number } count - Number of rows to move down (default: 1)
 * 
 * @since Introduced in v0.2.0
 * @returns { string } The ANSI escape sequence for moving cursor down
 */
const cursorDown = (count: number = 1): string => ESC + count + 'B'

/**
 * Moves the cursor forward by the specified count.
 * 
 * @param { number } count - Number of rows to move forward (default: 1)
 * 
 * @since Introduced in v0.2.0
 * @returns { string } The ANSI escape sequence for moving cursor forward
 */
const cursorForward = (count: number = 1): string => ESC + count + 'C'

/**
 * Moves the cursor backward by the specified count.
 * 
 * @param { number } count - Number of rows to move backward (default: 1)
 * 
 * @since Introduced in v0.2.0
 * @returns { string } The ANSI escape sequence for moving cursor backward
 */
const cursorBackward = (count: number = 1): string => ESC + count + 'D'

/** Moes the cursor to the first column of the current row. */
const cursorLeft = ESC + 'G'

/**
 * Save the current cursor position.
 * Uses different sequences for Terminal.app vs other terminals.
 */
const cursorSavePosition = isTerminalApp ? '\u001B7' : ESC + 's'

/**
 * Restores the cursor to the last saved position.
 * Uses different sequences for Terminal.app vs other terminals.
 */
const cursorRestorePosition = isTerminalApp ? '\u001B8' : ESC + 'u'

/**
 * Requests the terminal to report the cursor position.
 * The terminal will respond by writing an escape sequence to stdin.
 */
const cursorGetPosition = ESC + '6n'

/** Moves the cursor to the beginning of the next line. */
const cursorNextLine = ESC + 'E'

/** Moves the cursor to the beginning of the previous line. */
const cursorPrevLine = ESC + 'F'

/** Hides the cursor. */
const cursorHide = ESC + '?25l'

/** Shows the cursor. */
const cursorShow = ESC + '?25h'

/**
 * Erases the specified number of lines from the current position.
 * 
 * @param { number } count - Number of lines to erase
 * 
 * @since Introduced in v0.2.0
 * @returns The ANSI escape sequence for erasing lines
 */
const eraseLines = (count: number): string => {
    let clear = ''

    for(let i = 0; i < count; i++) {
        clear += eraseLine + (i < count - 1 ? cursorUp() : '')
    }

    if(count) {
        clear += cursorLeft
    }

    return clear
}

/** Erases from the current cursor position to the end of the line. */
const eraseEndLine = ESC + 'K'

/** Erases from the beginning of the line to the current cursor position. */
const eraseStartLine = ESC + '1K'

/** Erases the entire current line. */
const eraseLine = ESC + '2K'

/** Erases from the current cursor position to the end of the start. */
const eraseDown = ESC + 'J'

/** Erases from the beginning of the screen to the current cursor position. */
const eraseUp = ESC + '1J'

/** Erases the entire screen. */
const eraseScreen = ESC + '2J'

/** Scrolls the screen up by one line. */
const scrollUp = ESC + 'S'

/** Scrolls the screen down by one line. */
const scrollDown = ESC + 'T'

/** Clears the screen and moves cursor to home position. */
const clearScreen = '\u001Bc'

/**
 * Clears the terminal screen.
 * Uses different sequences for Windows vs other platforms.
 */
const clearTerminal = isWindows
    ? `${ eraseScreen }${ ESC }0f`
    // 1. Erases the screen (Only done in case `2` is not supported)
    // 2. Erases the whole screen including scrollback buffer
    // 3. Moves cursor to the to-left position
    : `${ eraseScreen }${ ESC }3J${ ESC }H`

/** Switches to the alternative screen buffer. */
const enterAlternativeScreen = ESC + '?1049h'

/** Switches back to the normal screen buffer. */
const exitAlternativeScreen = ESC + '?10349l'

/** Output a beep sound. */
const beep = BEL

/**
 * Creates a clickable link in supported terminals.
 * 
 * @param { string } text - The text to display for the link
 * @param { string } url - The URL to open when clicked
 * 
 * @since Introduced in v0.2.0
 * @returns { string } The ANSI escape sequence for crating a link
 */
const link = (text: string, url: string): string => [
    OSC,
    '8',
    SEP,
    SEP,
    url,
    BEL,
    text,
    OSC,
    '8',
    SEP,
    SEP,
    BEL
].join('')

/** Options for displaying images in the terminal. */
interface ImageOptions {
    /** Width of the image in pixels or cells. */
    width?: number

    /** Height of the image in pixels or cells. */
    height?: number

    /**
     * Whether to preserve the aspect ratio of the image.
     * @default true
     */
    preserveAspectRatio?: boolean
}

/**
 * Displays an image in supported terminals (like iTerm2).
 * 
 * @param { Buffer | string } data - The image data (will be base64 encoded)
 * @param { ImageOptions } options - Options for displaying the image
 * 
 * @since Introduced in v0.2.0
 * @returns { string } The ANSI escape sequence for displaying an image
 */
const image = (data: Buffer | string, options: ImageOptions = {}): string => {
    let returnValue = `${ OSC }1337;File=inline=1`

    if(options.width) returnValue += `;width=${ options.width }`
    if(options.height) returnValue += `;height=${ options.height }`
    if(options.preserveAspectRatio === false) {
        returnValue += ';preserveAspectRatio=0'
    }

    return returnValue + ':' + (Buffer.isBuffer(data) ? data : Buffer.from(String(data))).toString('base64') + BEL
}

/** Options for iTerm2 annotations. */
interface AnnotationOptions {
    /** Whether to annotation is hidden. */
    isHidden?: number

    /** X coordinate of the annotation. */
    x?: number

    /** Y coordinate of the annotation. */
    y?: number

    /** Length of the annotation. */
    length?: number
}

/** iTerm2-specific terminal sequences. */
const iTerm = {
    /**
     * Sets the current working directory in iTerm2
     * 
     * @param cwd - The directory path to set as current (defaults to process.cwd())
     * @returns { string } The ANSI escape sequence for setting the current directory
     */
    setCwd: (cwd = cwdFunction()): string => `${ OSC }50;CurrentDir=${ cwd }${ BEL }`,

    /**
     * Creates an annotation in iTerm2
     * 
     * @param { string } message - The annotation message
     * @param { AnnotationOptions } options - Options for the annotation
     * 
     * @returns { string } The ANSI escape sequence for creating an annotation
     * @throws { Error } If x, y, and length are not all defined when x or y is defined 
     */
    annotation(message: string, options: AnnotationOptions = {}): string {
        let returnValue = `${ OSC }1337;`

        const hasX = options.x !== undefined
        const hasY = options.y !== undefined

        if((hasX || hasY) && !(hasX && hasY && options.length !== undefined)) {
            throw new Error('`x`, `y` and `length` must be defined when `x` or `y` is defined.')
        }

        message = message.replace('|', '')

        returnValue += options.isHidden ? 'AddHiddenAnnotation=' : 'AddAnnotation='

        if(options.length && options.length > 0) {
            returnValue += (
                hasX
                    ? [message, options.length, options.x, options.y]
                    : [options.length, message]
            ).join('|')
        } else {
            returnValue += message
        }

        return returnValue + BEL
    }
}


export type {
    ImageOptions,
    AnnotationOptions
}

export {
    cursorTo,
    cursorMove,

    cursorUp,
    cursorDown,
    cursorForward,
    cursorBackward,

    cursorLeft,
    cursorSavePosition,
    cursorRestorePosition,
    cursorGetPosition,
    cursorNextLine,
    cursorPrevLine,
    cursorHide,
    cursorShow,

    eraseLines,
    eraseEndLine,
    eraseStartLine,
    eraseLine,
    eraseDown,
    eraseUp,
    eraseScreen,

    scrollUp,
    scrollDown,

    clearScreen,
    clearTerminal,

    enterAlternativeScreen,
    exitAlternativeScreen,
    beep, link,

    image,
    iTerm
}