/**
 * useFilters — manages dashboard filter state.
 *
 * Provides controlled filter values and pure filter functions that can be
 * applied to the raw NASA API data before rendering.
 *
 * Date inputs and minSpeed are debounced before being exposed to consumers
 * so that rapid keystrokes don't trigger API refetches on every character.
 *   - startDate / endDate: 500 ms debounce (triggers an API call)
 *   - minSpeed: 300 ms debounce (client-side filter only, but still avoids
 *     unnecessary re-renders while the user is typing)
 */
import { useState, useMemo, useCallback } from 'react'
import { getDefaultDateRange } from '../services/api'
import { useDebounce } from './useDebounce'

/**
 * @returns {{
 *   startDate: string,       — raw input value (for controlled input)
 *   setStartDate: (v: string) => void,
 *   endDate: string,         — raw input value (for controlled input)
 *   setEndDate: (v: string) => void,
 *   minSpeed: number,        — raw input value (for controlled input)
 *   setMinSpeed: (v: number) => void,
 *   cmeType: string,
 *   setCmeType: (v: string) => void,
 *   dateRange: { startDate: string, endDate: string }, — debounced, passed to API
 *   filterCMEAnalysis: (list: Array) => Array,         — uses debounced speed
 * }}
 */
export function useFilters() {
  const defaultRange = getDefaultDateRange()

  // Raw input state — bound directly to form controls
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate]     = useState(defaultRange.endDate)
  const [minSpeed, setMinSpeed]   = useState(0)
  const [cmeType, setCmeType]     = useState('ALL')

  // Debounced values — used for API calls and data filtering
  const debouncedStartDate = useDebounce(startDate, 500)
  const debouncedEndDate   = useDebounce(endDate,   500)
  const debouncedMinSpeed  = useDebounce(minSpeed,  300)

  // Memoised object so consumers using it as a dep don't re-render needlessly
  const dateRange = useMemo(
    () => ({ startDate: debouncedStartDate, endDate: debouncedEndDate }),
    [debouncedStartDate, debouncedEndDate]
  )

  /**
   * Filter CMEAnalysis records by speed and type.
   * Does NOT filter by date — date filtering is done at the API level.
   * Uses debounced speed so the filter doesn't thrash on every keystroke.
   * @param {Array} analysisList
   * @returns {Array}
   */
  const filterCMEAnalysis = useCallback(
    (analysisList) => {
      if (!Array.isArray(analysisList)) return []
      return analysisList.filter((a) => {
        if (debouncedMinSpeed > 0 && (a.speed ?? 0) < debouncedMinSpeed) return false
        if (cmeType !== 'ALL' && a.type !== cmeType)                      return false
        return true
      })
    },
    [debouncedMinSpeed, cmeType]
  )

  return {
    startDate, setStartDate,
    endDate,   setEndDate,
    minSpeed,  setMinSpeed,
    cmeType,   setCmeType,
    dateRange,
    filterCMEAnalysis,
  }
}
