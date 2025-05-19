const nowFunction = () => {
    if(globalThis.process?.hrtime?.bigint !== undefined) {
        return hrtime.bind(undefined, globalThis.process.hrtime.bigint())
    }

    if(globalThis.performance?.now !== undefined) {
        return performanceNow.bind(undefined, globalThis.performance.now())
    }

    return dateNow.bind(undefined, Date.now())
}

const hrtime = (start: bigint) => Number(globalThis.process.hrtime.bigint() - start)

const performanceNow = (start: number) => Math.round((globalThis.performance.now() - start) * 1e6)

const dateNow = (start: number) => (Date.now() - start) * 1e6


/**
 * Return the number of nanoseconds since the time origin
 * 
 * @example
 * ```typescript
 * const start = prciseNow();
 * const end = prciseNow();
 * 
 * const duration = end - start;
 * ```
 * 
 * @since Introduced in v0.2.0
 * @return { number } The number of nanoseconds since the time origin
 */
const preciseNow = nowFunction()

export default preciseNow