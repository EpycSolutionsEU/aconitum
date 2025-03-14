import parseMilliseconds from './parse-ms'

/**
 * Options for formatting milliseconds into a human-readable string
 */
interface PrettyMillisecondsOptions {
    /** Show colonNotation */
    colonNotation?: boolean
    /** Compact format */
    compact?: boolean
    /** Format sub-milliseconds */
    formatSubMilliseconds?: boolean
    /** Hide seconds in output */
    hideSeconds?: boolean
    /** Hide year in output */
    hideYear?: boolean
    /** Hide year and days in output */
    hideYearAndDays?: boolean
    /** Keep decimals on whole seconds */
    keepDecimalsOnWholeSeconds?: boolean
    /** Number of decimal digits for milliseconds */
    millisecondsDecimalDigits?: number
    /** Separate milliseconds */
    separateMilliseconds?: boolean
    /** Number of decimal digits for seconds */
    secondsDecimalDigits?: number
    /** Number of units to show */
    unitCount?: number
    /** Verbose output format */
    verbose?: boolean
}

/**
 * Checks if a value is zero (supports both number and bigint)
 * @param value - The value to check
 * @returns True if the value is zero
 */
const isZero = (value: number | bigint): boolean => value === 0 || value === 0n

/**
 * Pluralizes a word based on count
 * @param word - The word to pluralize
 * @param count - The count to check
 * @returns Pluralized word
 */
const pluralize = (word: string, count: number | bigint): string =>
    (count === 1 || count === 1n) ? word : `${word}s`

const SECOND_ROUNDING_EPSILON = 0.000_000_1
const ONE_DAY_IN_MILLISECONDS = 24n * 60n * 60n * 1000n

/**
 * Converts milliseconds to a human readable string
 * @param milliseconds - The number of milliseconds
 * @param options - Configuration options
 * @returns A human readable string
 * @throws {TypeError} When the input is not a finite number or bigint
 * 
 * @example
 * ```typescript
 * prettyMilliseconds(1337000)
 * //=> '22m 17s'
 * 
 * prettyMilliseconds(1337, { verbose: true })
 * //=> '1 second 337 milliseconds'
 * 
 * prettyMilliseconds(1335669000, { compact: true })
 * //=> '15d'
 * 
 * prettyMilliseconds(1337, { colonNotation: true })
 * //=> '00:01.337'
 * ```
 */
export default function prettyMilliseconds(
    milliseconds: number | bigint,
    options: PrettyMillisecondsOptions = {}
): string {
    const isBigInt = typeof milliseconds === 'bigint'
    if (!isBigInt && !Number.isFinite(milliseconds)) {
        throw new TypeError('Expected a finite number or bigint')
    }

    const sign = milliseconds < 0 ? '-' : ''
    milliseconds = milliseconds < 0 ? -milliseconds : milliseconds

    if (options.colonNotation) {
        options.compact = false
        options.formatSubMilliseconds = false
        options.separateMilliseconds = false
        options.verbose = false
    }

    if (options.compact) {
        options.unitCount = 1
        options.secondsDecimalDigits = 0
        options.millisecondsDecimalDigits = 0
    }

    const result: string[] = []

    /**
     * Floors a number to a specified number of decimal places
     * @param value - The value to floor
     * @param decimalDigits - Number of decimal digits
     * @returns The floored value as a string
     */
    const floorDecimals = (value: number, decimalDigits: number): string => {
        const flooredInterimValue = Math.floor((value * (10 ** decimalDigits)) + SECOND_ROUNDING_EPSILON)
        const flooredValue = Math.round(flooredInterimValue) / (10 ** decimalDigits)
        return flooredValue.toFixed(decimalDigits)
    }

    /**
     * Adds a time unit to the result array
     * @param value - The value to add
     * @param long - The long form of the unit
     * @param short - The short form of the unit
     * @param valueString - Optional custom string representation of the value
     */
    const add = (value: number | bigint, long: string, short: string, valueString?: string): void => {
        if (
            (result.length === 0 || !options.colonNotation)
            && isZero(value)
            && !(options.colonNotation && short === 'm')
        ) {
            return
        }

        valueString ??= String(value)
        if (options.colonNotation) {
            const wholeDigits = valueString.includes('.') ? valueString.split('.')[0].length : valueString.length
            const minLength = result.length > 0 ? 2 : 1
            valueString = '0'.repeat(Math.max(0, minLength - wholeDigits)) + valueString
        } else {
            valueString += options.verbose ? ' ' + pluralize(long, value) : short
        }

        result.push(valueString)
    }

    const parsed = parseMilliseconds(milliseconds)
    const days = BigInt(parsed.days)

    if (options.hideYearAndDays) {
        add((days * 24n) + BigInt(parsed.hours), 'hour', 'h')
    } else {
        if (options.hideYear) {
            add(days, 'day', 'd')
        } else {
            add(days / 365n, 'year', 'y')
            add(days % 365n, 'day', 'd')
        }

        add(Number(parsed.hours), 'hour', 'h')
    }

    add(Number(parsed.minutes), 'minute', 'm')

    if (!options.hideSeconds) {
        if (
            options.separateMilliseconds
            || options.formatSubMilliseconds
            || (!options.colonNotation && milliseconds < 1000)
        ) {
            const seconds = Number(parsed.seconds)
            const milliseconds = Number(parsed.milliseconds)
            const microseconds = Number(parsed.microseconds)
            const nanoseconds = Number(parsed.nanoseconds)

            add(seconds, 'second', 's')

            if (options.formatSubMilliseconds) {
                add(milliseconds, 'millisecond', 'ms')
                add(microseconds, 'microsecond', 'µs')
                add(nanoseconds, 'nanosecond', 'ns')
            } else {
                const millisecondsAndBelow =
                    milliseconds
                    + (microseconds / 1000)
                    + (nanoseconds / 1e6)

                const millisecondsDecimalDigits =
                    typeof options.millisecondsDecimalDigits === 'number'
                        ? options.millisecondsDecimalDigits
                        : 0

                const roundedMilliseconds = millisecondsAndBelow >= 1
                    ? Math.round(millisecondsAndBelow)
                    : Math.ceil(millisecondsAndBelow)

                const millisecondsString = millisecondsDecimalDigits
                    ? millisecondsAndBelow.toFixed(millisecondsDecimalDigits)
                    : roundedMilliseconds

                add(
                    parseFloat(millisecondsString.toString()),
                    'millisecond',
                    'ms',
                    millisecondsString.toString(),
                )
            }
        } else {
            const seconds = isBigInt
                ? Number(BigInt(milliseconds) % ONE_DAY_IN_MILLISECONDS) / 1000 % 60
                : (milliseconds as number) / 1000 % 60
            const secondsDecimalDigits =
                typeof options.secondsDecimalDigits === 'number'
                    ? options.secondsDecimalDigits
                    : 1
            const secondsFixed = floorDecimals(seconds, secondsDecimalDigits)
            const secondsString = options.keepDecimalsOnWholeSeconds
                ? secondsFixed
                : secondsFixed.replace(/\.0+$/, '')
            add(Number.parseFloat(secondsString), 'second', 's', secondsString)
        }
    }

    if (result.length === 0) {
        return sign + '0' + (options.verbose ? ' milliseconds' : 'ms')
    }

    const separator = options.colonNotation ? ':' : ' '
    if (typeof options.unitCount === 'number') {
        result.splice(options.unitCount)
    }

    return sign + result.join(separator)
}