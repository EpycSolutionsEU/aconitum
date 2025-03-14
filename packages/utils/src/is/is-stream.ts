/**
 * Options for stream checking functions
 */
export interface StreamCheckOptions {
    /**
     * Whether to check if the stream is open (writable/readable)
     * @default true
     */
    checkOpen?: boolean
}

/**
 * Checks if the provided value is a stream
 *
 * A stream is an object with a pipe method and is either readable, writable,
 * or both. If checkOpen is false, the function will not check if the stream
 * is currently open (readable or writable).
 *
 * @param stream - The value to check
 * @param options - Options for the check
 * @param options.checkOpen - Whether to check if the stream is open (writable/readable)
 * @returns Whether the value is a stream
 *
 * @example
 * ```ts
 * import { isStream } from './is-stream'
 * 
 * const fs = require('fs')
 * const readStream = fs.createReadStream('file.txt')
 * 
 * if (isStream(readStream)) {
 *   // It's a stream
 * }
 * ```
 */
export function isStream(stream: any, { checkOpen = true }: StreamCheckOptions = {}): boolean {
    return stream !== null
        && typeof stream === 'object'
        && (stream.writable || stream.readable || !checkOpen || (stream.writable === undefined && stream.readable === undefined))
        && typeof stream.pipe === 'function'
}

/**
 * Checks if the provided value is a writable stream
 *
 * A writable stream is a stream that has write and end methods,
 * and has writable, writableObjectMode, destroy, and destroyed properties.
 *
 * @param stream - The value to check
 * @param options - Options for the check
 * @param options.checkOpen - Whether to check if the stream is open (writable)
 * @returns Whether the value is a writable stream
 *
 * @example
 * ```ts
 * import { isWritableStream } from './is-stream'
 * 
 * const fs = require('fs')
 * const writeStream = fs.createWriteStream('file.txt')
 * 
 * if (isWritableStream(writeStream)) {
 *   // It's a writable stream
 * }
 * ```
 */
export function isWritableStream(stream: any, { checkOpen = true }: StreamCheckOptions = {}): boolean {
    return isStream(stream, { checkOpen })
        && (stream.writable || !checkOpen)
        && typeof stream.write === 'function'
        && typeof stream.end === 'function'
        && typeof stream.writable === 'boolean'
        && typeof stream.writableObjectMode === 'boolean'
        && typeof stream.destroy === 'function'
        && typeof stream.destroyed === 'boolean'
}

/**
 * Checks if the provided value is a readable stream
 *
 * A readable stream is a stream that has a read method,
 * and has readable, readableObjectMode, destroy, and destroyed properties.
 *
 * @param stream - The value to check
 * @param options - Options for the check
 * @param options.checkOpen - Whether to check if the stream is open (readable)
 * @returns Whether the value is a readable stream
 *
 * @example
 * ```ts
 * import { isReadableStream } from './is-stream'
 * 
 * const fs = require('fs')
 * const readStream = fs.createReadStream('file.txt')
 * 
 * if (isReadableStream(readStream)) {
 *   // It's a readable stream
 * }
 * ```
 */
export function isReadableStream(stream: any, { checkOpen = true }: StreamCheckOptions = {}): boolean {
    return isStream(stream, { checkOpen })
        && (stream.readable || !checkOpen)
        && typeof stream.read === 'function'
        && typeof stream.readable === 'boolean'
        && typeof stream.readableObjectMode === 'boolean'
        && typeof stream.destroy === 'function'
        && typeof stream.destroyed === 'boolean'
}

/**
 * Checks if the provided value is a duplex stream
 *
 * A duplex stream is both a readable and writable stream.
 *
 * @param stream - The value to check
 * @param options - Options for the check
 * @returns Whether the value is a duplex stream
 *
 * @example
 * ```ts
 * import { isDuplexStream } from './is-stream'
 * 
 * const { Duplex } = require('stream')
 * const duplexStream = new Duplex()
 * 
 * if (isDuplexStream(duplexStream)) {
 *   // It's a duplex stream
 * }
 * ```
 */
export function isDuplexStream(stream: any, options: StreamCheckOptions = {}): boolean {
    return isWritableStream(stream, options)
        && isReadableStream(stream, options)
}

/**
 * Checks if the provided value is a transform stream
 *
 * A transform stream is a duplex stream that has a _transform method.
 *
 * @param stream - The value to check
 * @param options - Options for the check
 * @returns Whether the value is a transform stream
 *
 * @example
 * ```ts
 * import { isTransformStream } from './is-stream'
 * 
 * const { Transform } = require('stream')
 * const transformStream = new Transform()
 * 
 * if (isTransformStream(transformStream)) {
 *   // It's a transform stream
 * }
 * ```
 */
export function isTransformStream(stream: any, options: StreamCheckOptions = {}): boolean {
    return isDuplexStream(stream, options)
        && typeof stream._transform === 'function'
}