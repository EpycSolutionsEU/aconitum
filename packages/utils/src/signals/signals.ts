import { constants } from 'node:os'

import { SIGNALS } from './core.js'
import { getRealtimeSignals, RealtimeSignal } from './realtime.js'

/**
 * Interface representing a base signal object with its properties
 */
export interface Signal {
  /** The name of the signal (e.g., SIGTERM, SIGINT) */
  name: string
  /** The numeric value of the signal */
  number: number
  /** Description of what the signal does */
  description: string
  /** The default action when the signal is received */
  action: 'terminate' | 'core' | 'ignore' | 'pause' | 'unpause'
  /** Whether the signal is supported on the current platform */
  supported: boolean
  /** Whether the signal cannot be caught or ignored */
  forced: boolean
  /** The standard that defines this signal */
  standard: 'posix' | 'ansi' | 'bsd' | 'other'
}

/**
 * Interface for the input signal object before normalization
 */
interface SignalInput {
  name: string
  number: number
  description: string
  action: Signal['action']
  forced?: boolean
  standard: Signal['standard']
}

/**
 * Type definition for the OS constants signals object
 */
interface SignalConstants {
  [key: string]: number
}

/**
 * Retrieves a list of all known signals (including realtime signals) with information about them
 * 
 * This function combines the standard signals from SIGNALS constant with realtime signals,
 * normalizing them to ensure consistent properties across different operating systems.
 * 
 * @returns An array of normalized Signal objects
 */
export const getSignals = (): Signal[] => {
  const realtimeSignals = getRealtimeSignals()
  const signals = [...SIGNALS, ...realtimeSignals].map((signal): Signal => normalizeSignal(signal as SignalInput))
  return signals
}

/**
 * Normalizes a signal object by adding OS-specific information and default values
 * 
 * @param signal - The input signal object to normalize
 * @param signal.name - The name of the signal
 * @param signal.number - The default signal number
 * @param signal.description - Description of the signal's purpose
 * @param signal.action - The default action when the signal is received
 * @param signal.forced - Whether the signal cannot be caught or ignored (defaults to false)
 * @param signal.standard - The standard that defines this signal
 * @returns A normalized Signal object with OS-specific information
 */
const normalizeSignal = ({
  name,
  number: defaultNumber,
  description,
  action,
  forced = false,
  standard,
}: SignalInput): Signal => {
  const {
    signals: { [name]: constantSignal },
  } = constants as { signals: SignalConstants }
  const supported = constantSignal !== undefined
  const number = supported ? constantSignal : defaultNumber
  return { name, number, description, supported, action, forced, standard }
}