/**
 * Options for the isInteractive function
 */
export interface InteractiveOptions {
    /**
     * The stream to check for interactivity
     * @default process.stdout
     */
    stream?: NodeJS.WriteStream & {
        isTTY?: boolean;
    };
}

/**
 * Checks if a stream is interactive
 * 
 * A stream is considered interactive if it's connected to a TTY,
 * the TERM environment variable isn't 'dumb', and the process
 * isn't running in a CI environment.
 * 
 * @param options - Options for the check
 * @param options.stream - The stream to check for interactivity (defaults to process.stdout)
 * @returns Whether the stream is interactive
 * 
 * @example
 * ```ts
 * import { isInteractive } from './is-interactive'
 * 
 * if (isInteractive()) {
 *   // The current stdout is interactive
 *   console.log('Running in an interactive terminal');
 * } else {
 *   console.log('Running in a non-interactive environment');
 * }
 * ```
 */
export default function isInteractive({ stream = process.stdout }: InteractiveOptions = {}): boolean {
    return Boolean(
        stream && stream.isTTY &&
        process.env.TERM !== 'dumb' &&
        !('CI' in process.env)
    );
}