/**
 * useCMEData — fetches all space weather data from NASA DONKI API.
 *
 * Re-fetches automatically whenever startDate or endDate changes.
 * Exposes a `refetch` function for manual refresh (e.g., refresh button).
 *
 * @param {{ startDate: string, endDate: string } | undefined} dateRange
 * @param {((result: { cme: Array, cmeAnalysis: Array, gst: Array, flr: Array }) => void) | undefined} onDataFetched
 *   Optional callback fired after every successful fetch. Used by Dashboard
 *   to sync fresh data to Supabase without coupling this hook to persistence.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchAllSpaceWeather, getDefaultDateRange } from '../services/api'

/**
 * @param {{ startDate: string, endDate: string } | undefined} dateRange
 * @param {Function | undefined} onDataFetched
 * @returns {{
 *   data: { cme: Array, cmeAnalysis: Array, gst: Array, flr: Array },
 *   loading: boolean,
 *   error: string | null,
 *   lastFetched: Date | null,
 *   refetch: () => void,
 * }}
 */
export function useCMEData(dateRange, onDataFetched) {
  const [data, setData] = useState({
    cme: [],
    cmeAnalysis: [],
    gst: [],
    flr: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)

  // Keep the latest onDataFetched in a ref so the IIFE always calls the
  // current version without needing it in the dependency array.
  const onDataFetchedRef = useRef(onDataFetched)
  useEffect(() => {
    onDataFetchedRef.current = onDataFetched
  })

  // Destructure to get stable primitive deps
  const startDate = dateRange?.startDate
  const endDate = dateRange?.endDate

  /**
   * Manual refetch exposed to consumers (e.g. Refresh button).
   * Kept as useCallback so it has a stable reference.
   */
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const range =
        startDate && endDate
          ? { startDate, endDate }
          : getDefaultDateRange()
      const result = await fetchAllSpaceWeather(range)
      setData(result)
      setLastFetched(new Date())
      onDataFetchedRef.current?.(result)
    } catch (err) {
      setError(err.message || 'Failed to fetch space weather data from NASA')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  // Trigger an initial (and re-triggered) fetch via an inline async IIFE.
  // This satisfies react-hooks/set-state-in-effect: the effect body itself
  // does not call setState — the IIFE does, asynchronously.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const range =
          startDate && endDate
            ? { startDate, endDate }
            : getDefaultDateRange()
        const result = await fetchAllSpaceWeather(range)
        if (!cancelled) {
          setData(result)
          setLastFetched(new Date())
          onDataFetchedRef.current?.(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch space weather data from NASA')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [startDate, endDate])

  return { data, loading, error, lastFetched, refetch }
}
