/**
 * This is not the set of all possible signals.
 * 
 * It IS, however, the set of all signals that trigger an exit
 * on either Linux or BSD systems. Linux is a superset of the
 * signal names supported on BSD, and the unknown signals just
 * just fail to register, so we can catch that easily enough.
 * 
 * Windows signals are a different set, since there are signals
 * that terminate Windows processes, but don't terminate (or 
 * don't even exist) on Posix systems.
 * 
 * Don't bother with SIGKILL. It's uncatchable, which means
 * that we can't fire any callbacks anyway.
 * 
 * If a user does happen to register a handler on a non-fatal
 * signal like SIGWINCH or something, and then exit, it'll
 * end up firing `prcoess.emit('exit')`, so the handler will
 * be fired anyway.
 * 
 * SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised 
 * artificially, inheriently leave the process in a state from
 * which it is not safe to try and enter JS listeners.
 */


/**
 * Array of signals that trigger an exit on various platforms.
 * 
 * This array contains signals that will cause a process to
 * exit on different operating systems:
 * - Base signals (SIGHUP, SIGINT, SIGTERM) works on all platforms
 * - Additional Unix/Linux signals are added for non-Windows platforms
 * - Linux-specific signals are added only on Linux
 */
const signals: NodeJS.Signals[] = []

// Common termination signals that work across platforms
signals.push('SIGHUP', 'SIGINT', 'SIGTERM')

// Unix/Linux specific signals (not available on Windows)
if(process.platform !== 'win32') {
    signals.push(
        'SIGALRM',      // Alarm clock (timer)
        'SIGABRT',      // Abort signal from abort(3)
        'SIGVTALRM',    // Virtual timer expired
        'SIGXCPU',      // CPU time limit exceeded
        'SIGXFSZ',      // File size limit exceeded
        'SIGUSR2',      // User-defined signal 2
        'SIGTRAP',      // Trace/breakpoint trap
        'SIGSYS',       // Bad system call
        'SIGQUIT',      // Quit from keyboard
        'SIGIOT'        // IOT trap (synonym for SIGABRT)
    )
}

// Linux-specific signals
if(process.platform === 'linux') {
    signals.push(
        'SIGIO',        // I/O now possible
        'SIGPOLL',      // Pollable eent occurred
        'SIGPWR',       // Power failure
        'SIGSTKFLT'     // Stack fault on coprocessor
    )
}

/**
 * A function that takes an exit code and signal as arguments
 * 
 * In the case of signal exits *only*, a return value of true
 * will indicate that the signal is being handled, and we should
 * not synthetically exit with the signal we received. Regardless
 * of the handler return value, the handler is unloaded when an
 * otherwise fatal signal is received, so you get exactly 1 shot
 * at it, unless you add another onExit handler at that point.
 * 
 * In the case of numeric code exits, we may already have committed
 * to exiting the process, for example via a fatal exception or
 * unhandled promise rejection, so it is impossible to stop safely.
 * 
 * @returns
 *   - true: Indicates that the signal is being handled and the process should not exit
 *   - void/undefined: The process will continue with its exit sequence
 */
type Handler = (
    /**
     * The exit code of the process. Will be:
     *   - A number if the process is exiting with a specific exit code
     *   - null if the process is existing due to a signal
     *   - undefined in some edge cases
     */
    code: number | null | undefined,

    /**
     * The signal that caused the exit (e.g. 'SIGTERM', 'SIGINT').
     * Will be null if the process is exiting normally without a signal.
     */
    signal: NodeJS.Signals | null
) => true | void

/**
 * Type definition for exit events
 * 
 * @property 'exit' - Triggered when the process is about to exit. This is the primary event
 *                    that most handlers should listen to for performing cleanup operations.
 * @property 'afterExit' - Triggered after the 'exit' event has been processed. This is useful
 *                         for handlers that should run after all normal exit handlers.
 */
type ExitEvent = 'afterExit' | 'exit'

/** Type definition for tracking emitted events */
type Emitted = { [k in ExitEvent]: boolean }

/** Type definition for storing event listeners */
type Listeners = { [k in ExitEvent]: Handler[] }

/** Symbol used to store the exit emitter globally */
const kExitEmitter = Symbol.for('signal-exit emitter')

/** Extended global object type with optional exit emitter */
const global: typeof globalThis & { [kExitEmitter]?: ExitEmitter } = globalThis

/** Reference to Object.defineProperty for defining properties */
const ObjectDefineProperty = Object.defineProperty.bind(Object)

/** Type definition for a process with required methods for signal handling */
type ProcessRE = NodeJS.Process & {
    reallyExit: (code?: number | undefined | null) => any
    emit: (ev: string, ...a: any[]) => any
}

/**
 * Checks if a process object is suitable for signal handling
 * 
 * @param { any } process - The process object to check
 * @returns { boolean } True if the process object has the required methods, false otherwise
 */
const processOk = (process: any): process is ProcessRE =>
    !!process &&
    typeof process === 'object' &&
    typeof process.removeListener === 'function' &&
    typeof process.emit === 'function' &&
    typeof process.reallyExit === 'function' &&
    typeof process.listeners === 'function' &&
    typeof process.kill === 'function' &&
    typeof process.pid === 'number' &&
    typeof process.on === 'function'

/** 
 * Interface for the exit emitter that manages exit events and listeners.
 * 
 * The ExitEmitter is responsible for tracking exit events, managing event listeners,
 * and emotting events when the process is about to exit. It provides methods for
 * registering and removing event listeners, and for emitting events to those listeners.
 * 
 * This interface is used internally by the module and is not typically accessed directly
 * by the consumers of the module. Instead, consumers should use the exported `onExit` function.
 */
interface ExitEmitter {
    emitted: Emitted
    listeners: Listeners
    count: number
    id: number

    on(event: ExitEvent, handler: Handler): void
    removeListener(event: ExitEvent, handler: Handler): void
    
    emit(event: ExitEvent, code: number | null | undefined, signal: NodeJS.Signals | null): boolean
}

/**
 * Creates a new exit emitter or returns the existing global one.
 * 
 * This function ensures that only one exit emitter exists globally, creating it if necessary.
 * The exit emitter is stored as non-enumerable property on the global object using a Symbol key,
 * which prevents accidental access or modification.
 * 
 * @returns { ExitEmitter } An exit emitter instance that can be used to register and manage exit handlers
 * @internal This function is used internally by the module and is not typically called directly
 */
const createExitEmitter = (): ExitEmitter => {
    if(global[kExitEmitter]) return global[kExitEmitter]

    const emitter: ExitEmitter = {
        emitted: {
            afterExit: false,
            exit: false
        },
        listeners: {
            afterExit: [],
            exit: []
        },
        count: 0,
        id: Math.random(),

        /**
         * Registers an event listener.
         * 
         * @param { ExitEvent } event - The event to listen for
         * @param { Handler } func - The handler function to call
         */
        on(event: ExitEvent, func: Handler) {
            this.listeners[event].push(func)
        },

        /**
         * Removes an event listener
         * 
         * @param { ExitEvent } event - The event to remove the listener from
         * @param { Handler } func - The handler function to remove
         */
        removeListener(event: ExitEvent, func: Handler) {
            const listener = this.listeners[event]
            const i = listener.indexOf(func)

            if(i === -1) return

            if(i === 0 && listener.length === 1) {
                listener.length = 0
            } else {
                listener.splice(i, 1)
            }
        },

        /**
         * Emits an event to all listeners
         * 
         * @param { ExitEvent } event - The event to emit
         * @param { number | null | undefined } code - The exit code
         * @param { NodeJS.Signals | null } signal - The signal that caused the exit
         * 
         * @returns { boolean } True if any listener returned true, false otherwise
         */
        emit(event: ExitEvent, code: number | null | undefined, signal: NodeJS.Signals | null): boolean {
            if(this.emitted[event]) return false

            this.emitted[event] = true
            let ret: boolean = false

            for(const func of this.listeners[event]) {
                ret = func(code, signal) === true || ret
            }

            if(event === 'exit') {
                ret = this.emit('afterExit', code, signal) || ret
            }

            return ret
        }
    }

    ObjectDefineProperty(global, kExitEmitter, {
        value: emitter,
        writable: false,
        enumerable: false,
        configurable: false
    })

    return emitter
}

/**
 * Alternative signal to use on Windows instead of SIGHUP.
 * 
 * Windows doesn't support SIGHUP, so we use SIGINT as a fallback when running on Windows platforms.
 * This ensures consistent behavior across different operation systems.
 * 
 * @internal
 */
const hupSig = process.platform === 'win32' ? 'SIGINT' : 'SIGHUP'

/**
 * Creates signal listeners for a process.
 * 
 * This function creates listeners for each supported signal that will be triggered when
 * the signal is received. Each listener checks if it's the only remaining listener for
 * that signal (excluding other signal-exit instances), and if so, it unloads the signal
 * handlers and emits the 'exit' event.
 * 
 * The function includes special handling to detect other versions of signal-exit that
 * might be running in the same process, to ensure proper coordination between them.
 * 
 * @param { ProcessRE } process - The process object to create listeners for
 * @param { ExitEmitter } emitter - The exit emitter to use for emitting events
 * 
 * @returns An object mapping signal names to their corresponding listener functions
 * @internal This function is used internally by the module
 */
const createSignalListeners = (process: ProcessRE, emitter: ExitEmitter): { [k in NodeJS.Signals]?: () => void } => {
    const sigListeners : { [k in NodeJS.Signals]?: () => void } = { }

    for(const sig of signals) {
        sigListeners[sig] = () => {
            // If there are no other listeners, an exit is coming!
            // Simplest way: remove us and then re-send the signal.
            // We know that this will kill the process, so we can
            // safely emit now.
            const listeners = process.listeners(sig)
            let { count } = emitter

            const p = process as unknown as {
                __signal_exit_emitter__?: { count: number }
            }

            if(
                typeof p.__signal_exit_emitter__ === 'object' &&
                typeof p.__signal_exit_emitter__.count === 'number'
            ) count += p.__signal_exit_emitter__.count

            if(listeners.length === count) {
                unload()

                const ret = emitter.emit('exit', null, sig)
                const s = sig === 'SIGHUP' ? hupSig : sig

                if(!ret) process.kill(process.pid, s)
            }
        }
    }

    return sigListeners
}

// Sotre original process methods
let originalProcessReallyExit: ProcessRE['reallyExit']
let originalProcessEmit: ProcessRE['emit']

// Store signal listeners
let sigListeners: { [k in NodeJS.Signals]?: () => void } = {}

// Track if signal handlers are loaded
let loaded = false

// Create the exit emitter
const emitter = createExitEmitter()

/**
 * Handles process.reallyExit calls by intercepting them to emit exit events.
 * 
 * This function is used to replace the original process.reallyExit method. When called,
 * it sets the process.exitCode to the provided code (or 0 if none is provided), emits
 * the 'exit' event with the exit code, and then calls the original reallyExit method.
 * 
 * @param { number | null | undefined } code - The exit code to use (defaults to 0 if not provided)
 * 
 * @returns The result of the original rallyExit call
 * @internal This function is used internally by the module
 */
const processReallyExit = (code?: number | null | undefined) => {
    if(!processOk(process)) return 0
    process.exitCode = code || 0

    emitter.emit('exit', process.exitCode, null)
    return originalProcessReallyExit.call(
        process,
        process.exitCode
    )
}

/**
 * Handles process.emit calls by intercepting 'exit' events.
 * 
 * This function replaces the original process.emit method to intercept 'exit' events.
 * When an 'exit' event is emitted, it updates the process.exitCode if a numeric code
 * is provided, calls the original emit method, and then emits the 'exit' event on the
 * exit emitter.
 * 
 * @param { ExitEvent } event - The event name being emitted
 * @param { any[] } args - The arguments to pass to the event handlers
 * 
 * @returns { any } The result of the original emit call
 * @internal This function is used internally by the module
 */
const processEmit = (event: ExitEvent, ...args: any[]): any => {
    const original = originalProcessEmit

    if(event === 'exit' && processOk(process)) {
        if(typeof args[0] === 'number') {
            process.exitCode = args[0]
        }

        const ret = original.call(process, event, ...args)
        emitter.emit('exit', (process.exitCode as number | null | undefined), null)

        return ret
    } else {
        return original.call(process, event, ...args)
    }
}

/**
 * Loads signal handlers and sets up the process to handle exit events.
 * 
 * This function performs the following operations:
 * 1. Stores the original process methods for later restoration
 * 2. Creates signal listeners for each supported signal
 * 3. Registers those listeners with the process
 * 4. Overrides process.emit and process.reallyExit to capture exit events
 * 
 * This function is called automatically when the first exit handler is registered
 * via `onExit()`, so it's typically not necessary to call it directly.
 * 
 * @internal
 */
const load = () => {
    if(loaded) return
    loaded = true

    // This is the number of onSignalExit's that are in play.
    // It's important so that we can count the correct number of
    // listeners on signals, and don't wait for the other one to
    // handle it instead of us.
    emitter.count += 1

    // Store original process methods
    originalProcessReallyExit = (process as ProcessRE).reallyExit
    originalProcessEmit = (process as ProcessRE).emit

    // Create signal listeners
    sigListeners = createSignalListeners(process as ProcessRE, emitter)

    // Register signal handlers
    for(const signal of signals) {
        try {
            const func = sigListeners[signal]
            if(func) process.on(signal, func)
        } catch(_) { }
    }

    // Override process methods
    process.emit = (event: string, ...args: any[]) => {
        return processEmit(event as ExitEvent, ...args)
    }

    (process as ProcessRE).reallyExit = (code?: number | null | undefined) => {
        return processReallyExit(code)
    }
}

/**
 * Unloads signal handlers and restores the original process behavior.
 * 
 * This function performs the following operations:
 * 1. Restores the original process.emit and process.reallyExit methods
 * 2. Removes all signal listeners that were registered by this module
 * 
 * This function is called automatically when the last exit handler is removed,
 * so it's typically not necessary to call it directly.
 * 
 * @internal
 */
const unload = () => {
    if(!loaded) return
    loaded = false

    // Restore original process methods
    process.emit = originalProcessEmit;
    (process as ProcessRE).reallyExit = originalProcessReallyExit

    // Remove signal handlers
    for(const signal of signals) {
        const listener = sigListeners[signal]
        if(listener) process.removeListener(signal, listener)
    }

    sigListeners = {}
}

/**
 * Registers a callback to be called when the process exits.
 * 
 * This is the primary function exported by this module. It allows you to register
 * a callback that will be executed when the process is about to exit, either due to
 * a signal (like SIGTERM or SIGINT) or a normal exit (like process.exit()).
 * 
 * The callback receives two parameters:
 * - code: The exit code (number) or null/undefined if exiting due to a signal
 * - signal: The signal name (string) or null if exiting normally
 * 
 * @param { Handler } callback - The callback function to be called when the process exits
 * @param options - Options for the callback
 * @param options.alwaysLast - When true, the callback will be registered for the 'afterExit' event
 *                         instead of the 'exit' event, ensuring it runs after all normal exit handlers
 * 
 * @example
 * ```typescript
 * import onExit from '@aconitum/utils';
 * 
 * // Basic usage
 * onExit((code, signal) => {
 *   console.log(`Exiting with code ${code} and signal ${signal}`);
 *   // Perform cleanup
 * });
 * 
 * // With options and cleanup
 * const removeHandler = onExit((code, signal) => {
 *   // This handler will run after all other exit handlers
 *   console.log('Final cleanup');
 * }, { alwaysLast: true });
 * 
 * // Later, if you want to remove the handler
 * removeHandler();
 * ```
 * 
 * @since Introduced in v0.2.0
 * @returns A function that, when called, will unregister the callback. This is useful for cleanup
 *          or when the component that registered the handler is being destroyed.
 */
const onExit = (callback: Handler, options?: { alwaysLast?: boolean }) => {
    if(!processOk(process)) return () => { }
    if(loaded === false) load()

    const event: ExitEvent = options?.alwaysLast ? 'afterExit' : 'exit'
    emitter.on(event, callback)

    return () => {
        emitter.removeListener(event, callback)

        if(
            emitter.listeners['exit'].length === 0 &&
            emitter.listeners['afterExit'].length === 0
        ) unload()
    }
}


export type { Handler }

export {
    signals,
    load, unload
}

export default onExit