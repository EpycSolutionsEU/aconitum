/**
 * Constants for line ending characters and their binary representations
 */
const LF = '\n';
const LF_BINARY = LF.codePointAt(0)!;
const CR = '\r';
const CR_BINARY = CR.codePointAt(0)!;

/**
 * Strips the final newline character(s) from a string input
 * @param input - The string to process
 * @returns The input string with the final newline character(s) removed
 */
const stripFinalNewlineString = (input: string): string =>
    input.at(-1) === LF
        ? input.slice(0, input.at(-2) === CR ? -2 : -1)
        : input;

/**
 * Strips the final newline character(s) from a Uint8Array input
 * @param input - The Uint8Array to process
 * @returns The input Uint8Array with the final newline character(s) removed
 */
const stripFinalNewlineBinary = (input: Uint8Array): Uint8Array =>
    input.at(-1) === LF_BINARY
        ? input.subarray(0, input.at(-2) === CR_BINARY ? -2 : -1)
        : input;

/**
 * Strips the final newline character(s) from a string or Uint8Array input.
 * Handles both LF (\n) and CRLF (\r\n) line endings.
 * 
 * @example
 * ```typescript
 * // String input
 * stripFinalNewline('hello\n'); // returns 'hello'
 * stripFinalNewline('hello\r\n'); // returns 'hello'
 * stripFinalNewline('hello'); // returns 'hello'
 * 
 * // Uint8Array input
 * const data = new Uint8Array([104, 101, 108, 108, 111, 10]); // 'hello\n'
 * stripFinalNewline(data); // returns Uint8Array([104, 101, 108, 108, 111])
 * ```
 * 
 * @param input - The input to process, either a string or a Uint8Array
 * @returns The input with the final newline character(s) removed
 * @throws {Error} If the input is neither a string nor a Uint8Array
 */
export default function stripFinalNewline(input: string | Uint8Array): string | Uint8Array {
    if (typeof input === 'string') {
        return stripFinalNewlineString(input);
    }

    if (!(ArrayBuffer.isView(input) && input.BYTES_PER_ELEMENT === 1)) {
        throw new Error('Input must be a string or a Uint8Array');
    }

    return stripFinalNewlineBinary(input);
}