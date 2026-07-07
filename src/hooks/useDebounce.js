/**
 * useDebounce — returns a debounced copy of `value` that only updates
 * after `delay` ms of inactivity.
 *
 * @template T
 * @param {T} value   - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {T}
 */
import { useState, useEffect } from 'react'

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
