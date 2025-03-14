import { constants } from 'node:os'

import { SIGRTMAX } from './realtime.js'
import { getSignals, Signal } from './signals.js'

/**
 * Interface representing a mapping of signal names to their properties
 */
export interface SignalsByName {
  [name: string]: Signal
}

/**
 * Interface representing a mapping of signal numbers to their properties
 */
export interface SignalsByNumber {
  [number: number]: Signal | undefined
}

/**
 * Retrieves an object mapping signal names to their properties
 * The object is sorted by signal number
 * 
 * @returns An object mapping signal names to their properties
 */
const getSignalsByName = (): SignalsByName => {
  const signals = getSignals()
  return Object.fromEntries(signals.map(getSignalByName))
}

/**
 * Creates a tuple of signal name and properties for use in Object.fromEntries
 * 
 * @param signal - The signal object to transform
 * @returns A tuple of [name, properties]
 */
const getSignalByName = (signal: Signal): [string, Signal] => [
  signal.name,
  signal
]

/**
 * A mapping of signal names to their properties
 */
export const signalsByName: SignalsByName = getSignalsByName()

/**
 * Retrieves an object mapping signal numbers to their properties
 * The object is sorted by signal number
 * 
 * @returns An object mapping signal numbers to their properties
 */
const getSignalsByNumber = (): SignalsByNumber => {
  const signals = getSignals()
  const length = SIGRTMAX + 1
  const signalsA = Array.from(
    { length },
    (_, number) => getSignalByNumber(number, signals)
  )
  return Object.assign({}, ...signalsA)
}

/**
 * Creates an object mapping a signal number to its properties
 * 
 * @param number - The signal number to look up
 * @param signals - Array of all available signals
 * @returns An object with the signal number as key and properties as value
 */
const getSignalByNumber = (
  number: number,
  signals: Signal[]
): { [key: number]: Signal } | Record<string, never> => {
  const signal = findSignalByNumber(number, signals)

  if (signal === undefined) {
    return {}
  }

  return { [number]: signal }
}

/**
 * Finds a signal by its number, prioritizing OS-specific numbers
 * Several signals might share the same number due to OS-specific mappings
 * 
 * @param number - The signal number to look up
 * @param signals - Array of all available signals
 * @returns The matching signal object or undefined if not found
 */
const findSignalByNumber = (number: number, signals: Signal[]): Signal | undefined => {
  const signal = signals.find(({ name }) => constants.signals[name] === number)

  if (signal !== undefined) {
    return signal
  }

  return signals.find((signalA) => signalA.number === number)
}

/**
 * A mapping of signal numbers to their properties
 */
export const signalsByNumber: SignalsByNumber = getSignalsByNumber()