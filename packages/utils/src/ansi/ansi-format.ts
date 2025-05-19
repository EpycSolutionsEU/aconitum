/**
 * ANSI text formatting utilities for terminal output.
 * 
 * This module provides functions for formatting text with ANSI escape
 * codes, including wrapping text to a specific width and trimming text
 * while presering ANSI styling.
 */

import stringWidth from '../string/string-width.js'
import ansiRegex from './ansi-regex.js'
import stripAnsi from './ansi-strip.js'

/** Options for wrapping text with ANSI escape codes. */
export interface WrapOptions {
    /** 
     * The maximum width of each line (in visible characters).
     * @default 80
     */
    width?: number

    /**
     * The string to use for indenting wrapped lines.
     * @default ''
     */
    indent?: string

    /**
     * Whether to trim leading/trailing whitespace from wrapped lines.
     * @default false
     */
    trim?: boolean

    /**
     * Whether to hard-wrap words that exceed the width.
     * @default false
     */
    hardWrap?: boolean
}

/** Options for trimming text with ANSI escape codes. */
export interface TrimOptions {
    /**
     * Whether to trim the start of the string.
     * @default true
     */
    start?: boolean

    /**
     * Whether to trim the end of the string.
     * @default true
     */
    end?: boolean
}

/**
 * Wraps a string with ANSI escape codes to the specified width while
 * preserving styling.
 * 
 * This function ensures that ANSI escape codes are preserved in the
 * wrapped text, and that the visible width of each line does not exceed
 * the specified width.
 * 
 * @param { string } text - The text to wrap
 * @param { WrapOptions } options - Options for wrapping the text
 * 
 * @example
 * ```typescript
 * import { ansiFormat } from '@aconitum/utils';
 * 
 * // Wrap text to 40 columns with indentation
 * const wrapped = ansiFormat.wrap('\u001B[31mThis is a long text that needs to be wrapped\u001B[0m', {
 *   width: 40,
 *   indent: '  '
 * });
 * 
 * console.log(wrapped);
 * 
 * // Output:
 * // \u001B[31mThis is a long text that needs to be\u001B[0m
 * // \u001B[31m  wrapped\u001B[0m
 * ```
 * 
 * @returns { string } The wrapped text with preserved ANSI styling
 */
function wrap(text: string, options: WrapOptions = {}): string {
    if(typeof text !== 'string') {
        throw new TypeError(`Expected a string, got ${ typeof text }`)
    }

    const {
        width = 80,
        indent = '',
        trim: shouldTrim = false,
        hardWrap = false
    } = options

    // If the string is empty or the width is 0 or less, return the original string
    if(text === '' || width <= 0) return text

    // Calculate the effective width (accounting for indent)
    const indentWidth = stringWidth(indent)
    const effectiveWidth = Math.max(width - indentWidth, 1)

    // Split the input text into lines
    const lines = text.split('\n')
    const result: string[] = []

    for(const line of lines) {
        // If the line is empty, add it as is
        if(line === '') {
            result.push('')
            continue
        }

        let remainingLine = shouldTrim ? trimAnsi(line) : line
        let resultLine = ''

        // Store the current ANSI state
        const ansiCodes: string[] = []
        let currentAnsiState = ''

        // Process the line until it's empty
        while(remainingLine.length > 0) {
            const visibleLine = stripAnsi(remainingLine)
            const visibleWidth = stringWidth(visibleLine)

            // If the visible width is less or equal to the effective width, add the while line
            if(visibleWidth <= effectiveWidth) {
                resultLine = remainingLine
                remainingLine = ''
            } else {
                // Find where to split the line
                let splitIndex = 0
                let currentWidth = 0

                if(hardWrap) {
                    // Hard wrap: split exactly at the width limit
                    for(let i = 0; i < visibleLine.length; i++) {
                        const charWidth = stringWidth(visibleLine[i])
                        if(currentWidth + charWidth > effectiveWidth) break

                        currentWidth += charWidth
                        splitIndex = i + 1
                    }
                } else {
                    // Soft wrap: try to split at whitespace
                    let lastWhitespaceIndex = -1

                    for(let i = 0; i < visibleLine.length; i++) {
                        const char = visibleLine[i]
                        const charWidth = stringWidth(char)

                        // If adding this character would exceed the width
                        if(currentWidth + charWidth > effectiveWidth) {
                            // If we found a whitespace, split there
                            if(lastWhitespaceIndex !== -1) {
                                // +1 the exclude the whitespace
                                splitIndex = lastWhitespaceIndex + 1
                            } else {
                                // No whitespace found, hard wrap at current position
                                splitIndex = i
                            }

                            break
                        }

                        // Update the current width and check for whitespace
                        currentWidth += charWidth
                        if(/\s/.test(char)) lastWhitespaceIndex = i

                        // If we've reached the end, use the entire line
                        if(i === visibleLine.length - 1) splitIndex = visibleLine.length
                    }

                    // If we couldn't find a good split point, hard wrap
                    if(splitIndex === 0) {
                        for(let i = 0; i < visibleLine.length; i++) {
                            const charWidth = stringWidth(visibleLine[i])
                            if(currentWidth + charWidth > effectiveWidth) break

                            currentWidth += charWidth
                            splitIndex = i + 1
                        }
                    }
                }

                // Map the visible index back to the original string with ANSI codes
                let realSplitIndex = 0
                let visibleIndex = 0

                const ansiRegExp = ansiRegex()
                let match

                // Reset the lastIndex to start from the beginning
                ansiRegExp.lastIndex = 0

                while((match = ansiRegExp.exec(remainingLine)) !== null) {
                    const ansiCode = match[0]
                    const ansiIndex = match.index

                    // If the ANSI code appears before our current position
                    if(ansiIndex <= realSplitIndex) {
                        // Store this ANSI code to maintain state
                        ansiCodes.push(ansiCode)

                        // Update the current ANSI state
                        currentAnsiState = ansiCodes.join('')

                        // Adjust the real split index to account for this ANSI code
                        realSplitIndex = ansiRegExp.lastIndex
                    } else {
                        // We've gone past where we need to split
                        break
                    }
                }

                // Now map the visible split index to the real index
                while(visibleIndex < splitIndex && realSplitIndex < remainingLine.length) {
                    const char = remainingLine[realSplitIndex]

                    // Skip ANSI escape codes
                    if(char === '\u001B') {
                        const match = remainingLine.slice(realSplitIndex).match(ansiRegExp)

                        if(match && match.index === 0) {
                            const ansiCode = match[0]
                            ansiCodes.push(ansiCode)

                            currentAnsiState = ansiCodes.join('')
                            realSplitIndex += ansiCode.length

                            continue
                        }
                    }

                    realSplitIndex++
                    visibleIndex++
                }

                // Split the line
                resultLine = remainingLine.slice(0, realSplitIndex)
                remainingLine = remainingLine.slice(realSplitIndex)

                // If we have ANSI codes and remaining text, prepend the current ANSI state
                if(ansiCodes.length > 0 && remainingLine.length > 0) {
                    remainingLine = currentAnsiState + remainingLine
                }

                // Trim the result line if requested
                if(shouldTrim) {
                    resultLine = trimAnsi(resultLine, { end: true, start: false })
                }
            }

            // Add the result line to the output
            if(result.length > 0 || resultLine.length > 0) {
                result.push(result.length > 0 ? indent + resultLine : resultLine)
            }
        }
    }

    return result.join('\n')
}

/**
 * Trims whitespace from a string with ANSI escape codes while
 * preserving styling.
 * 
 * This function ensures that ANSI escape codes are preserved when
 * trimming whitespace from the start and/or end of a string.
 * 
 * @param { string } text - The text to trim
 * @param { TrimOptions } options - Options for trimming the text
 * 
 * @example
 * ```typescript
 * import { ansiFormat } from '@aconitum/utils';
 * 
 * // Trim whitespace from both ends
 * const trimmed = ansiFormat.trim('  \u001B[31mHello World\u001B[0m  ');
 * 
 * console.log(trimmed);
 * // Output: \u001B[31mHello World\u001B[0m
 * 
 * // Trim only from the end
 * const trimmedEnd = ansiFormat.trim('  \u001B[31mHello World\u001B[0m  ', { start: false });
 * 
 * console.log(trimmedEnd);
 * // Output:   \u001B[31mHello World\u001B[0m
 * ```
 * 
 * @returns { string } The trimmed text with preserved ANSI styling
 */
function trimAnsi(text: string, options: TrimOptions = {}): string {
    if(typeof text !== 'string') {
        throw new TypeError(`Expected a string, got ${ typeof text }`)
    }

    const {
        start = true,
        end = true
    } = options

    // If neither start nor end trimming is requested, return the original string
    if(!start && !end) return text

    // Get the visible (non-ANSI) content
    const visibleContent = stripAnsi(text)

    // If the visible content is empty or only whitespace, return an empty string
    if(visibleContent.trim() === '') return ''

    // Find the indices of the first and last non-whitespace characters
    let firstNonWhitespace = 0
    let lastNonWhitespace = visibleContent.length - 1

    if(start) {
        while(firstNonWhitespace < visibleContent.length && /\s/.test(visibleContent[firstNonWhitespace])) {
            firstNonWhitespace++
        }
    }

    if(end) {
        while(lastNonWhitespace >= 0 && /\s/.test(visibleContent[lastNonWhitespace])) {
            lastNonWhitespace--
        }
    }

    // Map these indices back to the original string with ANSI codes
    let realStartIndex = 0
    let realEndIndex = text.length
    let visibleIndex = 0

    const ansiRegExp = ansiRegex()

    // Find the real start index
    if(start) {
        for(let i = 0; i < text.length; i++) {
            // Skip ANSI escape codes
            if(text[i] == '\u001B') {
                const match = text.slice(i).match(ansiRegExp)

                if(match && match.index === 0) {
                    i += match[0].length - 1
                    continue
                }
            }

            if(visibleIndex === firstNonWhitespace) {
                realStartIndex = i
                break
            }

            visibleIndex++
        }
    }

    // Reset for finding the end index
    visibleIndex = 0

    // Find the real end index
    if(end) {
        for(let i = 0; i < text.length; i++) {
            // Skip ANSI escape codes
            if(text[i] === '\u001B') {
                const match = text.slice(i).match(ansiRegExp)

                if(match && match.index === 0) {
                    i += match[0].length - 1 // -1 because the loop will increment i
                    continue
                }
            }

            if(visibleIndex === lastNonWhitespace + 1) {
                realEndIndex = i
                break
            }

            visibleIndex++
        }
    }

    // Extract all ANSI codes from the beginning of the string
    const startCodes: string[] = []

    let match
    ansiRegExp.lastIndex = 0

    while((match = ansiRegExp.exec(text)) !== null) {
        if(match.index >= realStartIndex) break
        startCodes.push(match[0])
    }

    // Extract the trimmed content
    let result = text.slice(realStartIndex, realEndIndex)

    // Prepend any ANSI codes from the beginning
    if(startCodes.length > 0) {
        result = startCodes.join('') + result
    }

    return result
}


export default {
    wrap, 
    trim: trimAnsi
}