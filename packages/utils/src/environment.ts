/**
 * Collection of environment detection utilities to identify the current JavaScript runtime,
 * operating system, and platform.
 *
 * These utilities use feature detection and environment-specific globals to determine
 * the execution context. All checks are performed lazily to avoid unnecessary
 * computations.
 * 
 * @since Introduced in v0.1.0
 */

// Add TypeScript DOM lib type references
/// <reference lib="dom" />
/// <reference lib="webworker" />

/**
 * Indicates whether the code is running in a browser environment.
 * @returns { boolean } True if running in a browser context with a window and document object.
 */
export const isBrowser: boolean = globalThis.window?.document !== undefined

/**
 * Indicates whether the code is running in Node.js.
 * @returns { boolean } True if running in Node.js environment.
 */
export const isNode: boolean = globalThis.process?.versions?.node !== undefined

/**
 * Indicates whether the code is running in Bun runtime.
 * @returns {boolean} True if running in Bun environment.
 */
export const isBun: boolean = globalThis.process?.versions?.bun !== undefined

/**
 * Indicates whether the code is running in Deno runtime.
 * @returns { boolean } True if running in Deno environment.
 */
export const isDeno: boolean = (globalThis as any).Deno?.version?.deno !== undefined

/**
 * Indicates whether the code is running in Electron.
 * @returns { boolean } True if running in Electron environment.
 */
export const isElectron: boolean = globalThis.process?.versions?.electron !== undefined

/**
 * Indicates whether the code is running in jsdom environment.
 * @returns { boolean } True if running in jsdom.
 */
export const isJsDom: boolean = globalThis.navigator?.userAgent?.includes('jsdom') === true

/**
 * Indicates whether the code is running in a Web Worker context.
 * @returns { boolean } True if running in any type of Web Worker.
 */
export const isWebWorker: boolean = typeof WorkerGlobalScope !== 'undefined' && globalThis instanceof WorkerGlobalScope

/**
 * Indicates whether the code is running in a Dedicated Web Worker.
 * @returns { boolean } True if running in a Dedicated Web Worker.
 */
export const isDedicatedWorker: boolean = typeof DedicatedWorkerGlobalScope !== 'undefined' && globalThis instanceof DedicatedWorkerGlobalScope

/**
 * Indicates whether the code is running in a Shared Web Worker.
 * @returns { boolean } True if running in a Shared Web Worker.
 */
export const isSharedWorker: boolean = typeof SharedWorkerGlobalScope !== 'undefined' && globalThis instanceof SharedWorkerGlobalScope

/**
 * Indicates whether the code is running in a Service Worker.
 * @returns { boolean } True if running in a Service Worker.
 */
export const isServiceWorker: boolean = typeof ServiceWorkerGlobalScope !== 'undefined' && globalThis instanceof ServiceWorkerGlobalScope

// Note: Intentionally not DRYing up platform detection to keep them "lazy".
/**
 * Platform information from navigator.userAgentData if available.
 */
const platform: string | undefined = globalThis.navigator?.userAgent

/**
 * Indicates whether the code is running on macOS.
 * Detects both Intel and Apple Silicon Mac's.
 * @returns { boolean } True if running on macOS.
 */
export const isMacOS: boolean = platform === 'macOS'
	|| globalThis.navigator?.platform === 'MacIntel' // Even on Apple silicon Macs.
	|| globalThis.navigator?.userAgent?.includes(' Mac ') === true
	|| globalThis.process?.platform === 'darwin'

/**
 * Indicates whether the code is running on Windows.
 * @returns { boolean } True if running on Windows.
 */
export const isWindows: boolean = platform === 'Windows'
	|| globalThis.navigator?.platform === 'Win32'
	|| globalThis.process?.platform === 'win32'

/**
 * Indicates whether the code is running on Linux.
 * @returns { boolean } True if running on Linux.
 */
export const isLinux: boolean = platform === 'Linux'
	|| globalThis.navigator?.platform?.startsWith('Linux') === true
	|| globalThis.navigator?.userAgent?.includes(' Linux ') === true
	|| globalThis.process?.platform === 'linux'

/**
 * Indicates whether the code is running on iOS.
 * Detects iPad, iPhone, and iPod devices.
 * @returns { boolean } True if running on iOS.
 */
export const isIos: boolean = platform === 'iOS'
	|| (globalThis.navigator?.platform === 'MacIntel' && globalThis.navigator?.maxTouchPoints > 1)
	|| /iPad|iPhone|iPod/.test(globalThis.navigator?.platform)

/**
 * Indicates whether the code is running on Android.
 * @returns { boolean}  True if running on Android.
 */
export const isAndroid: boolean = platform === 'Android'
	|| globalThis.navigator?.platform === 'Android'
	|| globalThis.navigator?.userAgent?.includes(' Android ') === true
	|| globalThis.process?.platform === 'android'