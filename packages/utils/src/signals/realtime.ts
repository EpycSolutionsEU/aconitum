/**
 * Interface representing a realtime signal object with its properties
 */
export interface RealtimeSignal {
  /** The name of the signal in format SIGRTX where X is a number */
  name: string
  /** The numeric value of the signal */
  number: number
  /** The default action when the signal is received */
  action: 'terminate'
  /** Description of the signal's purpose */
  description: string
  /** The standard that defines this signal */
  standard: 'posix'
}

/** Minimum realtime signal number */
const SIGRTMIN = 34

/** Maximum realtime signal number */
export const SIGRTMAX = 64

/**
 * Creates a realtime signal object with the specified index
 * 
 * @param value - Unused array mapping value
 * @param index - Zero-based index used to calculate signal number
 * @returns A realtime signal object
 */
const getRealtimeSignal = (_value: unknown, index: number): RealtimeSignal => ({
  name: `SIGRT${index + 1}`,
  number: SIGRTMIN + index,
  action: 'terminate',
  description: 'Application-specific signal (realtime)',
  standard: 'posix',
})

/**
 * Generates an array of realtime signals from SIGRTMIN to SIGRTMAX
 * 
 * This function creates an array of realtime signal objects, each representing
 * a POSIX realtime signal. The signals are numbered sequentially from SIGRTMIN
 * to SIGRTMAX (inclusive).
 * 
 * @returns An array of realtime signal objects
 */
export const getRealtimeSignals = (): RealtimeSignal[] => {
  const length = SIGRTMAX - SIGRTMIN + 1
  return Array.from({ length }, getRealtimeSignal)
}