/**
 * Module that provides signal handling and exit management for Node.js applications.
 *
 * This module exports functionality to:
 * 1. Track signals that trigger process termination on different operating systems
 * 2. Register callbacks to be executed when the process is exiting
 * 3. Manage signal handlers for graceful application shutdown
 */

/**
 * This is not the set of all possible signals.
 *
 * It IS, however, the set of all signals that trigger
 * an exit on either Linux or BSD systems. Linux is a
 * superset of the signal names supported on BSD, and
 * the unknown signals just fail to register, so we can
 * catch that easily enough.
 *
 * Windows signals are a different set, since there are
 * signals that terminate Windows processes, but don't
 * terminate (or don't even exist) on Posix systems.
 *
 * Don't bother with SIGKILL. It's uncatchable, which
 * means that we can't fire any callbacks anyway.
 *
 * If a user does happen to register a handler on a non-
 * fatal signal like SIGWINCH or something, and then
 * exit, it'll end up firing `process.emit('exit')`, so
 * the handler will be fired anyway.
 *
 * SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
 * artificially, inherently leave the process in a
 * state from which it is not safe to try and enter JS
 * listeners.
 */

/**
 * Array of signals that trigger an exit on various platforms.
 * 
 * This array contains signals that will cause a process to exit on different operating systems:
 * - Base signals (SIGHUP, SIGINT, SIGTERM) work on all platforms
 * - Additional Unix/Linux signals are added for non-Windows platforms
 * - Linux-specific signals are added only on Linux
 */
export const signals: NodeJS.Signals[] = [];

// Common termination signals that work across platforms
signals.push('SIGHUP', 'SIGINT', 'SIGTERM');

// Unix/Linux specific signals (not available on Windows)
if (process.platform !== 'win32') {
  signals.push(
    'SIGALRM',   // Alarm clock (timer)
    'SIGABRT',   // Abort signal from abort(3)
    'SIGVTALRM', // Virtual timer expired
    'SIGXCPU',   // CPU time limit exceeded
    'SIGXFSZ',   // File size limit exceeded
    'SIGUSR2',   // User-defined signal 2
    'SIGTRAP',   // Trace/breakpoint trap
    'SIGSYS',    // Bad system call
    'SIGQUIT',   // Quit from keyboard
    'SIGIOT'     // IOT trap (synonym for SIGABRT)
    // should detect profiler and enable/disable accordingly.
    // see #21
    // 'SIGPROF'  // Profiling timer expired
  );
}

// Linux-specific signals
if (process.platform === 'linux') {
  signals.push(
    'SIGIO',     // I/O now possible
    'SIGPOLL',   // Pollable event occurred
    'SIGPWR',    // Power failure
    'SIGSTKFLT'  // Stack fault on coprocessor
  );
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
 */
export type Handler = (
  code: number | null | undefined,
  signal: NodeJS.Signals | null
) => true | void;

/**
 * Type definition for exit events
 * - 'exit': Triggered when the process is about to exit
 * - 'afterExit': Triggered after the 'exit' event
 */
type ExitEvent = 'afterExit' | 'exit';

/**
 * Type definition for tracking emitted events
 */
type Emitted = { [k in ExitEvent]: boolean };

/**
 * Type definition for storing event listeners
 */
type Listeners = { [k in ExitEvent]: Handler[] };

/**
 * Symbol used to store the exit emitter globally
 */
const kExitEmitter = Symbol.for('signal-exit emitter');

/**
 * Extended global object type with optional exit emitter
 */
const global: typeof globalThis & { [kExitEmitter]?: Emitter } = globalThis;

/**
 * Reference to Object.defineProperty for defining properties
 */
const ObjectDefineProperty = Object.defineProperty.bind(Object);

/**
 * Type definition for a process with required methods for signal handling
 */
type ProcessRE = NodeJS.Process & {
  reallyExit: (code?: number | undefined | null) => any;
  emit: (ev: string, ...a: any[]) => any;
};

/**
 * Checks if a process object is suitable for signal handling
 * 
 * @param process - The process object to check
 * @returns True if the process object has the required methods, false otherwise
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
  typeof process.on === 'function';

/**
 * Special purpose event emitter for handling exit events
 */
class Emitter {
  /**
   * Tracks which events have been emitted
   */
  emitted: Emitted = {
    afterExit: false,
    exit: false,
  };

  /**
   * Stores event listeners
   */
  listeners: Listeners = {
    afterExit: [],
    exit: [],
  };

  /**
   * Number of active signal handlers
   */
  count: number = 0;

  /**
   * Unique identifier for this emitter
   */
  id: number = Math.random();

  /**
   * Creates a new emitter or returns the existing global one
   */
  constructor() {
    if (global[kExitEmitter]) {
      return global[kExitEmitter];
    }
    ObjectDefineProperty(global, kExitEmitter, {
      value: this,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }

  /**
   * Registers an event listener
   * 
   * @param ev - The event to listen for
   * @param fn - The handler function to call
   */
  on(ev: ExitEvent, fn: Handler) {
    this.listeners[ev].push(fn);
  }

  /**
   * Removes an event listener
   * 
   * @param ev - The event to remove the listener from
   * @param fn - The handler function to remove
   */
  removeListener(ev: ExitEvent, fn: Handler) {
    const list = this.listeners[ev];
    const i = list.indexOf(fn);
    if (i === -1) {
      return;
    }
    if (i === 0 && list.length === 1) {
      list.length = 0;
    } else {
      list.splice(i, 1);
    }
  }

  /**
   * Emits an event to all listeners
   * 
   * @param ev - The event to emit
   * @param code - The exit code
   * @param signal - The signal that caused the exit
   * @returns True if any listener returned true, false otherwise
   */
  emit(
    ev: ExitEvent,
    code: number | null | undefined,
    signal: NodeJS.Signals | null
  ): boolean {
    if (this.emitted[ev]) {
      return false;
    }
    this.emitted[ev] = true;
    let ret: boolean = false;
    for (const fn of this.listeners[ev]) {
      ret = fn(code, signal) === true || ret;
    }
    if (ev === 'exit') {
      ret = this.emit('afterExit', code, signal) || ret;
    }
    return ret;
  }
}

/**
 * Base class for signal exit handlers
 */
abstract class SignalExitBase {
  /**
   * Registers a callback to be called when the process exits
   */
  abstract onExit(cb: Handler, opts?: { alwaysLast?: boolean }): () => void;
  
  /**
   * Loads signal handlers
   */
  abstract load(): void;
  
  /**
   * Unloads signal handlers
   */
  abstract unload(): void;
}

/**
 * Wraps a signal exit handler to expose only the necessary methods
 * 
   * @param handler - The signal exit handler to wrap
   * @returns An object with onExit, load, and unload methods
   */
  const signalExitWrap = <T extends SignalExitBase>(handler: T) => {
    return {
      onExit(cb: Handler, opts?: { alwaysLast?: boolean }) {
        return handler.onExit(cb, opts);
      },
      load() {
        return handler.load();
      },
      unload() {
        return handler.unload();
      },
    };
  };

  /**
   * Fallback implementation for environments where signal handling is not supported
   */
  class SignalExitFallback extends SignalExitBase {
    /**
     * No-op implementation of onExit
     */
    onExit() {
      return () => {};
    }
    
    /**
     * No-op implementation of load
     */
    load() {}
    
    /**
     * No-op implementation of unload
     */
    unload() {}
  }

  /**
   * Main implementation of signal exit handling
   */
  class SignalExit extends SignalExitBase {
    unload(): void {
      if (!this.#loaded) {
        return;
      }
      this.#loaded = false;
  
      // restore original process methods
      this.#process.reallyExit = this.#originalProcessReallyExit;
      this.#process.emit = this.#originalProcessEmit;
  
      // remove signal handlers
      for (const sig of signals) {
        const listener = this.#sigListeners[sig];
        if (listener) {
          this.#process.removeListener(sig, listener);
        }
      }
      this.#sigListeners = {};
    }
    /**
     * Alternative signal to use on Windows instead of SIGHUP
     */
    #hupSig = process.platform === 'win32' ? 'SIGINT' : 'SIGHUP';
    
    /**
     * Event emitter for exit events
     */
    #emitter = new Emitter();
    
    /**
     * Reference to the process object
     */
    #process: ProcessRE;
    
    /**
     * Original process.emit method
     */
    #originalProcessEmit: ProcessRE['emit'];
    
    /**
     * Original process.reallyExit method
     */
    #originalProcessReallyExit: ProcessRE['reallyExit'];
  
    /**
     * Signal listeners by signal name
     */
    #sigListeners: { [k in NodeJS.Signals]?: () => void } = {};
    
    /**
     * Whether signal handlers are loaded
     */
    #loaded: boolean = false;
  
    /**
     * Creates a new SignalExit instance
     * 
     * @param process - The process object to use
     */
    constructor(process: ProcessRE) {
      super();
      this.#process = process;
      // { <signal>: <listener fn>, ... }
      this.#sigListeners = {};
      for (const sig of signals) {
        this.#sigListeners[sig] = () => {
          // If there are no other listeners, an exit is coming!
          // Simplest way: remove us and then re-send the signal.
          // We know that this will kill the process, so we can
          // safely emit now.
          const listeners = this.#process.listeners(sig);
          let { count } = this.#emitter;
          // This is a workaround for the fact that signal-exit v3 and signal
          // exit v4 are not aware of each other, and each will attempt to let
          // the other handle it, so neither of them do. To correct this, we
          // detect if we're the only handler *except* for previous versions
          // of signal-exit, and increment by the count of listeners it has
          // created.
          const p = process as unknown as {
            __signal_exit_emitter__?: { count: number }
          };
          if (
            typeof p.__signal_exit_emitter__ === 'object' &&
            typeof p.__signal_exit_emitter__.count === 'number'
          ) {
            count += p.__signal_exit_emitter__.count;
          }
          if (listeners.length === count) {
            this.unload();
            const ret = this.#emitter.emit('exit', null, sig);
            const s = sig === 'SIGHUP' ? this.#hupSig : sig;
            if (!ret) process.kill(process.pid, s);
          }
        };
      }
  
      this.#originalProcessReallyExit = process.reallyExit;
      this.#originalProcessEmit = process.emit;
    }
  
    /**
     * Registers a callback to be called when the process exits
     * 
     * @param cb - The callback function
     * @param opts - Options for the callback
     * @param opts.alwaysLast - Whether the callback should be called after all other callbacks
     * @returns A function that unregisters the callback
     */
    onExit(cb: Handler, opts?: { alwaysLast?: boolean }) {
      if (!processOk(this.#process)) {
        return () => {};
      }
  
      if (this.#loaded === false) {
        this.load();
      }
  
      const ev = opts?.alwaysLast ? 'afterExit' : 'exit';
      this.#emitter.on(ev, cb);
      return () => {
        this.#emitter.removeListener(ev, cb);
        if (
          this.#emitter.listeners['exit'].length === 0 &&
          this.#emitter.listeners['afterExit'].length === 0
        ) {
          this.unload();
        }
      };
    }
  
    /**
     * Loads signal handlers
     */
    load() {
      if (this.#loaded) {
        return;
      }
      this.#loaded = true;
  
      // This is the number of onSignalExit's that are in play.
      // It's important so that we can count the correct number of
      // listeners on signals, and don't wait for the other one to
      // handle it instead of us.
      this.#emitter.count += 1;
  
      for (const sig of signals) {
        try {
          const fn = this.#sigListeners[sig];
          if (fn) this.#process.on(sig, fn);
        } catch (_) {}
      }
  
      this.#process.emit = (ev: string, ...a: any[]) => {
        return this.#processEmit(ev, ...a);
      };
      this.#process.reallyExit = (code?: number | null | undefined) => {
        return this.#processReallyExit(code);
      };
    }
  
    /**
     * Private method to handle process.reallyExit calls
     * 
     * @param code - The exit code
     * @returns The result of the original reallyExit call
     */
    #processReallyExit(code?: number | null | undefined) {
      if (!processOk(this.#process)) {
        return 0;
      }
      this.#process.exitCode = code || 0;
  
      this.#emitter.emit('exit', this.#process.exitCode, null);
      return this.#originalProcessReallyExit.call(
        this.#process,
        this.#process.exitCode
      );
    }
  
    /**
     * Private method to handle process.emit calls
     * 
     * @param ev - The event name
     * @param args - The event arguments
     * @returns The result of the original emit call
     */
    #processEmit(ev: string, ...args: any[]): any {
      const og = this.#originalProcessEmit;
      if (ev === 'exit' && processOk(this.#process)) {
        if (typeof args[0] === 'number') {
          this.#process.exitCode = args[0];
        }
        const ret = og.call(this.#process, ev, ...args);
        this.#emitter.emit('exit', this.#process.exitCode as number | null | undefined, null);
        return ret;
      } else {
        return og.call(this.#process, ev, ...args);
      }
    } 
}
