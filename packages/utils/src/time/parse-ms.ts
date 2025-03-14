/**
 * Interface representing the parsed time units from milliseconds
 */
interface ParsedTime {
    /** Number of days */
    days: number | bigint;
    /** Number of hours (0-23) */
    hours: number | bigint;
    /** Number of minutes (0-59) */
    minutes: number | bigint;
    /** Number of seconds (0-59) */
    seconds: number | bigint;
    /** Number of milliseconds (0-999) */
    milliseconds: number | bigint;
    /** Number of microseconds (0-999) */
    microseconds: number | bigint;
    /** Number of nanoseconds (0-999) */
    nanoseconds: number | bigint;
}

/**
 * Converts infinite numbers to zero
 * @param value - The number to check
 * @returns The original number if finite, 0 otherwise
 */
const toZeroIfInfinity = (value: number): number => Number.isFinite(value) ? value : 0;

/**
 * Parses a number of milliseconds into its constituent time units
 * @param milliseconds - The number of milliseconds to parse
 * @returns An object containing the parsed time units
 */
function parseNumber(milliseconds: number): ParsedTime {
    return {
        days: Math.trunc(milliseconds / 86_400_000),
        hours: Math.trunc(milliseconds / 3_600_000 % 24),
        minutes: Math.trunc(milliseconds / 60_000 % 60),
        seconds: Math.trunc(milliseconds / 1000 % 60),
        milliseconds: Math.trunc(milliseconds % 1000),
        microseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1000) % 1000),
        nanoseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1e6) % 1000),
    };
}

/**
 * Parses a bigint number of milliseconds into its constituent time units
 * @param milliseconds - The number of milliseconds to parse as a bigint
 * @returns An object containing the parsed time units as bigints
 */
function parseBigint(milliseconds: bigint): ParsedTime {
    return {
        days: milliseconds / 86_400_000n,
        hours: milliseconds / 3_600_000n % 24n,
        minutes: milliseconds / 60_000n % 60n,
        seconds: milliseconds / 1000n % 60n,
        milliseconds: milliseconds % 1000n,
        microseconds: 0n,
        nanoseconds: 0n,
    };
}

/**
 * Parses milliseconds into an object containing days, hours, minutes,
 * seconds, milliseconds, microseconds, and nanoseconds
 * 
 * @param milliseconds - The number of milliseconds to parse (as number or bigint)
 * @returns An object containing the parsed time units
 * @throws {TypeError} When the input is not a finite number or bigint
 * 
 * @example
 * ```typescript
 * parseMilliseconds(1337000);
 * // => {
 * //    days: 0,
 * //    hours: 0,
 * //    minutes: 22,
 * //    seconds: 17,
 * //    milliseconds: 0,
 * //    microseconds: 0,
 * //    nanoseconds: 0
 * // }
 * ```
 */
export default function parseMilliseconds(milliseconds: number | bigint): ParsedTime {
    switch (typeof milliseconds) {
        case 'number': {
            if (Number.isFinite(milliseconds)) {
                return parseNumber(milliseconds);
            }

            break;
        }

        case 'bigint': {
            return parseBigint(milliseconds);
        }

        // No default
    }

    throw new TypeError('Expected a finite number or bigint');
}