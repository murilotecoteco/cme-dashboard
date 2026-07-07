/**
 * Dashboard — main page of the Solar CME Monitor.
 *
 * Layout:
 *   1. Page header with title + last-updated timestamp + refresh button + sync indicator
 *   2. Summary stats (CMEStats)
 *   3. Filter controls (CMEFilters)
 *   4. CME event grid (CMEList)
 *
 * Auto-sync: after every successful NASA fetch, new CME events are upserted
 * to Supabase using Promise.allSettled (one failure never blocks others).
 * A session-scoped Set deduplicates upserts within the same browser session.
 * If Supabase is not configured the sync path is skipped entirely and the
 * Dashboard works in read-only NASA-API mode.
 */
import { useRef, useCallback, useState, useMemo } from 'react'
import { RefreshCw, Database } from 'lucide-react'
import CMEStats from '../components/cme/CMEStats'
import CMEList from '../components/cme/CMEList'
import CMEFilters from '../components/cme/CMEFilters'
import CMECharts from '../components/cme/CMECharts'
import { useCMEData } from '../hooks/useCMEData'
import { useSupabaseCME } from '../hooks/useSupabase'
import { useFilters } from '../hooks/useFilters'
import { formatDateTime } from '../utils/formatters'
import { isSupabaseConfigured } from '../services/supabase'
import { withRetry } from '../utils/retry'
import { matchAnalysis } from '../utils/matchAnalysis'

export default function Dashboard() {
  const {
    startDate, setStartDate,
    endDate,   setEndDate,
    minSpeed,  setMinSpeed,
    cmeType,   setCmeType,
    dateRange,
    filterCMEAnalysis,
  } = useFilters()

  const { saveCMEEvent } = useSupabaseCME()

  // syncedIds ref: used for O(1) dedup check without triggering re-renders.
  const syncedIds = useRef(new Set())

  // savedIds state: the Set rendered into CMECard "Saved ✓" badges.
  // Separate from the ref so reads during render are lint-safe.
  const [savedIds, setSavedIds] = useState(() => new Set())

  // Sync indicator state: how many new events were saved in the last sync run.
  const [syncCount, setSyncCount] = useState(null)

  /**
   * Build the Supabase row shape by merging a CME record with its matching
   * CMEAnalysis record (matched via associatedCMEID).
   * @param {Object} cme
   * @param {Array}  analysisList
   * @returns {Object}
   */
  function buildRow(cme, analysisList) {
    const analysis = matchAnalysis(analysisList, cme.activityID, cme.startTime)
    return {
      activity_id:       cme.activityID,
      start_time:        cme.startTime,
      source_location:   cme.sourceLocation    ?? null,
      active_region_num: cme.activeRegionNum   ?? null,
      link:              cme.link              ?? null,
      note:              cme.note              ?? null,
      catalog:           cme.catalog           ?? null,
      speed:             analysis?.speed       ?? null,
      half_angle:        analysis?.halfAngle   ?? null,
      cme_type:          analysis?.type        ?? null,
    }
  }

  /**
   * syncToSupabase — called by useCMEData after every successful fetch.
   * Skipped silently when Supabase is not configured.
   * Errors from individual upserts are console.warn'd, never surfaced to users.
   */
  const syncToSupabase = useCallback(async (result) => {
    if (!isSupabaseConfigured()) return

    const { cme = [], cmeAnalysis = [] } = result

    // Only process CMEs not yet synced in this session
    const newCMEs = cme.filter((c) => !syncedIds.current.has(c.activityID))
    if (!newCMEs.length) return

    const rows = newCMEs.map((c) => buildRow(c, cmeAnalysis))

    const outcomes = await Promise.allSettled(
      rows.map((row) => withRetry(() => saveCMEEvent(row)))
    )

    let saved = 0
    const newlySavedIds = []
    outcomes.forEach((outcome, i) => {
      const actId = rows[i].activity_id
      if (outcome.status === 'fulfilled' && !outcome.value?.error) {
        syncedIds.current.add(actId)
        newlySavedIds.push(actId)
        saved++
      } else {
        // Log but don't add to set — will be retried next fetch
        const reason = outcome.reason ?? outcome.value?.error
        console.warn(`[Sync] Failed to save ${actId}:`, reason)
      }
    })

    if (saved > 0) {
      setSavedIds((prev) => {
        const next = new Set(prev)
        newlySavedIds.forEach((id) => next.add(id))
        return next
      })
      setSyncCount(saved)
    }
  }, [saveCMEEvent])

  const { data, loading, error, lastFetched, refetch } = useCMEData(dateRange, syncToSupabase)

  // Apply client-side filters to analysis data (speed/type filters)
  // Date filter is applied server-side via API params
  const filteredAnalysis = useMemo(
    () => filterCMEAnalysis(data.cmeAnalysis),
    [filterCMEAnalysis, data.cmeAnalysis]
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Space Weather Dashboard</h2>
          <p className="text-slate-400 mt-1 text-sm">
            Real-time Coronal Mass Ejection data from NASA DONKI
          </p>
        </div>
        <div className="flex items-center gap-3">

          {/* Last-updated + sync indicator */}
          {lastFetched && (
            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <p className="text-xs text-slate-500">
                Updated {formatDateTime(lastFetched.toISOString())}
              </p>
              {isSupabaseConfigured() && syncCount !== null && (
                <p className="text-xs text-emerald-400/80 flex items-center gap-1">
                  <Database size={11} aria-hidden="true" />
                  {syncCount} synced to history
                </p>
              )}
            </div>
          )}

          <button
            id="btn-refresh"
            type="button"
            onClick={refetch}
            disabled={loading}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              bg-amber-500/10 border border-amber-400/20 text-amber-400
              hover:bg-amber-500/20 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <CMEStats data={data} />

      {/* ── Charts ── */}
      <CMECharts cmeAnalysis={data.cmeAnalysis} />

      {/* ── Filters ── */}
      <section
        aria-label="Data filters"
        className="rounded-xl border border-slate-800 bg-slate-900/30 p-4"
      >
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Filters</h3>
        <CMEFilters
          startDate={startDate}
          endDate={endDate}
          minSpeed={minSpeed}
          cmeType={cmeType}
          onStartDate={setStartDate}
          onEndDate={setEndDate}
          onMinSpeed={setMinSpeed}
          onCmeType={setCmeType}
        />
      </section>

      {/* ── CME Event Grid ── */}
      <section aria-label="CME events">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            CME Events
            {!loading && data.cme.length > 0 && (
              <span className="ml-2 text-base font-normal text-slate-400">
                ({data.cme.length})
              </span>
            )}
          </h3>
        </div>
        <CMEList
          cmeData={data.cme}
          cmeAnalysis={filteredAnalysis}
          loading={loading}
          error={error}
          savedIds={savedIds}
          onManualSave={(cme) => {
            const row = buildRow(cme, data.cmeAnalysis)
            saveCMEEvent(row)
              .then(({ error: sbErr }) => {
                if (!sbErr) {
                  syncedIds.current.add(cme.activityID)
                  setSavedIds((prev) => {
                    const next = new Set(prev)
                    next.add(cme.activityID)
                    return next
                  })
                  setSyncCount((n) => (n ?? 0) + 1)
                } else {
                  console.warn('[ManualSave] Supabase error:', sbErr)
                }
              })
              .catch((e) => console.warn('[ManualSave] Unexpected error:', e))
          }}
        />
      </section>

    </div>
  )
}
