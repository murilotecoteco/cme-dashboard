/**
 * useSupabaseCME — reads and writes CME event records from Supabase PostgreSQL.
 *
 * If Supabase is not configured (missing env vars), the hook returns an
 * informative error message without throwing. The configuration check is
 * evaluated once at initialization (useState initializer) so no setState
 * call is needed inside a useEffect body.
 *
 * Pagination: records are fetched in pages of PAGE_SIZE rows, ordered by
 * start_time descending. Call `loadMore()` to append the next page.
 * `hasMore` is false once a page returns fewer rows than PAGE_SIZE.
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabase'

const UNCONFIGURED_MSG =
  'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local'

const PAGE_SIZE = 50

/**
 * @returns {{
 *   records: Array,
 *   loading: boolean,
 *   loadingMore: boolean,
 *   error: string | null,
 *   hasMore: boolean,
 *   refetch: () => void,
 *   loadMore: () => void,
 *   saveCMEEvent: (event: Object) => Promise<{ data: any, error: any }>,
 * }}
 */
export function useSupabaseCME() {
  const [records, setRecords]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]       = useState(true)
  const [page, setPage]             = useState(0)
  // Pre-populate error if Supabase is unconfigured so we never need
  // to call setError() synchronously inside a useEffect body.
  const [error, setError] = useState(
    () => isSupabaseConfigured() ? null : UNCONFIGURED_MSG
  )

  /**
   * Fetch a single page from Supabase and either replace or append records.
   * @param {number} pageIndex - 0-based page index
   * @param {'replace' | 'append'} mode
   */
  const fetchPage = useCallback(async (pageIndex, mode) => {
    if (!isSupabaseConfigured()) {
      setError(UNCONFIGURED_MSG)
      return
    }

    const isFirstPage = mode === 'replace'
    if (isFirstPage) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    setError(null)

    try {
      const from = pageIndex * PAGE_SIZE
      const to   = from + PAGE_SIZE - 1

      const { data, error: sbError } = await supabase
        .from('cme_events')
        .select('*')
        .order('start_time', { ascending: false })
        .range(from, to)

      if (sbError) throw sbError

      const rows = data ?? []
      setHasMore(rows.length === PAGE_SIZE)

      if (mode === 'replace') {
        setRecords(rows)
        setPage(0)
      } else {
        setRecords((prev) => [...prev, ...rows])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch records from Supabase')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  /**
   * Manual refetch — resets to page 0 and replaces all records.
   */
  const refetch = useCallback(() => {
    setHasMore(true)
    fetchPage(0, 'replace')
  }, [fetchPage])

  /**
   * Load next page and append to existing records.
   */
  const loadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPage(nextPage, 'append')
  }, [page, fetchPage])

  /**
   * Upsert a single CME event into the cme_events table.
   * Uses activity_id as the conflict key — safe to call multiple times.
   * @param {Object} event — must match cme_events table schema
   * @returns {Promise<{ data: any, error: any }>}
   */
  const saveCMEEvent = useCallback(async (event) => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error: sbError } = await supabase
      .from('cme_events')
      .upsert(event, { onConflict: 'activity_id' })
      .select()
    return { data, error: sbError }
  }, [])

  // Initial fetch on mount. Skipped when Supabase is not configured —
  // error is already set by the useState initializer above.
  useEffect(() => {
    if (!isSupabaseConfigured()) return

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: sbError } = await supabase
          .from('cme_events')
          .select('*')
          .order('start_time', { ascending: false })
          .range(0, PAGE_SIZE - 1)

        if (sbError) throw sbError
        if (!cancelled) {
          const rows = data ?? []
          setRecords(rows)
          setHasMore(rows.length === PAGE_SIZE)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch records from Supabase')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return { records, loading, loadingMore, error, hasMore, refetch, loadMore, saveCMEEvent }
}
