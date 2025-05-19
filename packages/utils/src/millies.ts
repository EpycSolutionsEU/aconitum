/** Time helpers */
const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const WEEK = DAY * 7
const YEAR = DAY * 365.25

type Unit =
    | 'Years'
    | 'Year'
    | 'Yrs'
    | 'Yr'
    | 'Y'

    | 'Weeks'
    | 'Week'
    | 'W'

    | 'Days'
    | 'Day'
    | 'D'

    | 'Hours'
    | 'Hour'
    | 'Hrs'
    | 'Hr'
    | 'H'

    | 'Minutes'
    | 'Minute'
    | 'Mins'
    | 'Min'
    | 'M'

    | 'Seconds'
    | 'Second'
    | 'Secs'
    | 'Sec'
    | 'S'

    | 'Milliseconds'
    | 'Millisecond'
    | 'Msecs'
    | 'Msec'
    | 'Ms'

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>

export type StringValue =
    | `${ number }`
    | `${ number }${ UnitAnyCase }`
    | `${ number } ${ UnitAnyCase }`

    
interface Options {
    /**
     * Set to `true` to use verbose formatting.
     * @default false
     */
    long?: boolean
}


/**
 * Parse on format the given value
 * 
 * @param { StringValue | number } value - The string or nunber to convert
 * @param { Options } options - Options for the conversion
 * 
 * @throws { Error } Error if `value` is not a non-empty string or a number
 * @returns { number | string } The converted time value in milliseconds
 */
function milliesFunction(value: StringValue, options?: Options): number
function milliesFunction(value: number, options?: Options): string
function milliesFunction(value: StringValue | number, options?: Options): number | string {
    try {
        if(typeof value === 'number') return parse(value)
        else if(typeof value === 'string') return format(value, options)

        throw new Error('Value provided to millies() must be a string or number.')
    } catch(error) {
        const message = isError(error)
            ? `${ error.message }. value=${ JSON.stringify(value) }`
            : `An unknown error has occurred.`

        throw new Error(message)
    }
}


/**
 * Parse the given string and return milliseconds
 * 
 * @param { string } value - A string to parse to milliseconds
 * 
 * @returns { number } The parse value in milliseconds, or `NaN` if the string can't be parsed
 */
function parse(value: string | number): number {
    if(typeof value !== 'string' || value.length === 0 || value.length > 100) {
        throw new Error(`
            Value provided to millies.parse() must be a string with length between 1 and 99.
        `)
    }

    const match = /^(?<value>-?(?:\d+)?\.?\d+) *(?<type>milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(value)
    const groups = match?.groups as { value: string; type?: string } | undefined

    if(!groups) return NaN

    const number = parseFloat(groups.value)
    const type = (groups.type || 'ms').toLowerCase() as Lowercase<Unit>

    switch(type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return number * YEAR
        case 'weeks':
        case 'week':
        case 'w':
            return number * WEEK
        case 'days':
        case 'day':
        case 'd':
            return number * DAY
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return number * HOUR
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return number * MINUTE
        case 'seconds':
        case 'second':
        case 'secs':
        case'sec':
        case's':
            return number * SECOND
        case'milliseconds':
        case'millisecond':
        case'msecs':
        case'msec':
        case'ms':
            return number
        default:
            throw new Error(`The unit ${ type as string } was matched, but no matching case exists.`)
    }
}

/**
 * Parse the given StringValue and return milliseconds.
 * 
 * @param { StringValue } value - A typesafe StringValue to parse to milliseconds
 * 
 * @returns { number } The parsed value in milliseconds, or `NaN` if the string can't be parsed
 */
function parseStrict(value: StringValue): number {
    return parse(value)
}


/** Short format for `millies` */
function formatShort(millies: number): StringValue {
    const milliesAbs = Math.abs(millies)

    if(milliesAbs >= DAY) return `${ Math.round(millies / DAY ) }d`
    if(milliesAbs >= HOUR) return `${ Math.round(millies / HOUR ) }h`
    if(milliesAbs >= MINUTE) return `${ Math.round(millies / MINUTE ) }m`
    if(milliesAbs >= SECOND) return `${ Math.round(millies / SECOND ) }s`

    return `${ millies }ms`
}

/** Long format for `millies` */
function formatLong(millies: number): StringValue {
    const milliesAbs = Math.abs(millies)

    if(milliesAbs >= DAY) return plural(millies, milliesAbs, DAY, 'day')
    if(milliesAbs >= HOUR) return plural(millies, milliesAbs, HOUR, 'hour')
    if(milliesAbs >= MINUTE) return plural(millies, milliesAbs, MINUTE, 'minute')
    if(milliesAbs >= SECOND) return plural(millies, milliesAbs, SECOND, 'second')

    return `${ millies } ms`
}

/**
 * Format the given integer as a string
 * 
 * @param { number } millies - milliseconds to format
 * @param { Options } options - The options for the conversion
 * 
 * @returns { string } The formatted string
 */
function format(millies: string | number, options?: Options): string {
    if(typeof millies !== 'number' || !isFinite(millies)) {
        throw new Error(`Value provided to millies.format() must be of type number.`)
    }

    return options?.long ? formatLong(millies) : formatShort(millies)
}


/** Pluralization helper */
function plural(millies: number, milliesAbs: number, unit: number, name: string): StringValue {
    const isPlural = milliesAbs >= unit * 1.5
    return `${ Math.round(millies / unit ) } ${ name }${ isPlural ? 's' : '' }` as StringValue
}

/**
 * A type guard for errors.
 * @param { * } value - The value to test
 * @returns { boolean } A boolean `true` if the provided value is an Error-like-object 
 */
function isError(value: unknown): value is Error {
    return typeof value === 'object' && value !== null && 'message' in value
}


export { parse, parseStrict, format }
export default milliesFunction