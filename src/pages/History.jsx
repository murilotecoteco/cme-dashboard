/**
 * History — CME events stored in Supabase PostgreSQL.
 *
 * Features:
 *   - Setup prompt when Supabase is not configured
 *   - Skeleton loader on first load; spinner on refetch
 *   - Client-side sort (Start Time, Speed, Type) and text search
 *   - Tooltips on "—" cells explaining missing NASA data
 *   - "Load more" pagination (PAGE_SIZE rows per page via useSupabaseCME)
 */
import { useState, useMemo } from 'react'
import { Database, Inbox, RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react'
import { useSupabaseCME } from '../hooks/useSupabase'
import { isSupabaseConfigured } from '../services/supabase'
import TableSkeleton from '../components/ui/TableSkeleton'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatDateTime, formatSpeed } from '../utils/formatters'

// ─── Constants ────────────────────────────────────────────────────────────────

const NASA_MISSING_TOOLTIP = 'NASA did not report this value for this event'

// Columns that support sorting
const SORTABLE_COLUMNS = ['start_time', 'speed', 'cme_type']

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Setup instructions shown when VITE_SUPABASE_* env vars are missing */
function SetupPrompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center py-16">
      <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
        <Database size={36} aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Supabase Not Configured</h3>
        <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
          To view historical CME data, add your Supabase credentials to{' '}
          <code className="text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">
            .env.local
          </code>
        </p>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-left font-mono text-sm text-slate-300 max-w-md w-full">
        <p className="text-slate-500 mb-2 text-xs"># .env.local</p>
        <p>VITE_SUPABASE_URL=<span className="text-amber-400">https://xxx.supabase.co</span></p>
        <p>VITE_SUPABASE_ANON_KEY=<span className="text-amber-400">eyJ...</span></p>
      </div>
      <a
        href="https://supabase.com/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        className="
          px-4 py-2 rounded-lg text-sm font-medium
          bg-purple-500/10 border border-purple-400/20 text-purple-400
          hover:bg-purple-500/20 transition-colors
        "
      >
        Open Supabase Dashboard →
      </a>
    </div>
  )
}

/** Sort indicator icon for a column header */
function SortIcon({ column, sortKey, sortDir }) {
  if (sortKey !== column) return <ChevronsUpDown size={13} className="text-slate-600" aria-hidden="true" />
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="text-amber-400" aria-hidden="true" />
    : <ChevronDown size={13} className="text-amber-400" aria-hidden="true" />
}

/** Cell that shows "—" with a tooltip for missing NASA data */
function MissingCell({ value, className = '' }) {
  if (value) return <span className={className}>{value}</span>
  return (
    <span
      className="cursor-help text-slate-600 border-b border-dotted border-slate-600"
      title={NASA_MISSING_TOOLTIP}
      aria-label={NASA_MISSING_TOOLTIP}
    >
      —
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function History() {
  const { records, loading, loadingMore, error, hasMore, refetch, loadMore } = useSupabaseCME()

  // Sort state
  const [sortKey, setSortKey] = useState('start_time')
  const [sortDir, setSortDir] = useState('desc')

  // Search / filter state
  const [search, setSearch] = useState('')

  // Show setup prompt when Supabase is not configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SetupPrompt />
      </div>
    )
  }

  // ── Derived: filtered + sorted records ──
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const processedRecords = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? records.filter(
          (r) =>
            r.activity_id?.toLowerCase().includes(q) ||
            r.cme_type?.toLowerCase().includes(q)
        )
      : records

    return [...filtered].sort((a, b) => {
      let av = a[sortKey] ?? ''
      let bv = b[sortKey] ?? ''

      // Numeric sort for speed
      if (sortKey === 'speed') {
        av = av ?? -Infinity
        bv = bv ?? -Infinity
        return sortDir === 'asc' ? av - bv : bv - av
      }

      // String / date sort
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [records, search, sortKey, sortDir])

  function handleSortClick(column) {
    if (sortKey === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(column)
      setSortDir('desc')
    }
  }

  const columnDefs = [
    { key: 'activity_id', label: 'Activity ID',  sortable: false },
    { key: 'start_time',  label: 'Start Time',   sortable: true  },
    { key: 'speed',       label: 'Speed',         sortable: true  },
    { key: 'cme_type',    label: 'Type',          sortable: true  },
    { key: 'source_location', label: 'Location',  sortable: false },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Historical CME Data</h2>
          <p className="text-slate-400 mt-1 text-sm">
            CME events saved to Supabase PostgreSQL
          </p>
        </div>
        <button
          id="btn-history-refresh"
          type="button"
          onClick={refetch}
          disabled={loading}
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            bg-purple-500/10 border border-purple-400/20 text-purple-400
            hover:bg-purple-500/20 transition-all disabled:opacity-50
          "
        >
          <RefreshCw
            size={14}
            className={loading && records.length > 0 ? 'animate-spin' : ''}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-500/5 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Skeleton loader on first load ── */}
      {loading && records.length === 0 && !error && (
        <TableSkeleton rows={8} />
      )}

      {/* ── Empty state (after load, no records) ── */}
      {!loading && !error && records.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <Inbox size={28} aria-hidden="true" />
          </div>
          <p className="text-slate-300 font-semibold">No records in database</p>
          <p className="text-slate-500 text-sm mt-1">
            Records will appear here once CME events are saved from the Dashboard.
          </p>
        </div>
      )}

      {/* ── Search + Table ── */}
      {records.length > 0 && (
        <>
          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="history-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or type…"
              className="
                w-full pl-8 pr-3 py-2 text-sm rounded-lg
                bg-slate-800 border border-slate-700 text-slate-200
                placeholder-slate-500
                focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20
                transition-colors duration-200
              "
            />
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-700/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/70">
                  {columnDefs.map(({ key, label, sortable }) => (
                    <th
                      key={key}
                      className={`
                        text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide
                        ${sortable ? 'cursor-pointer select-none hover:text-slate-200 transition-colors' : ''}
                      `}
                      onClick={sortable ? () => handleSortClick(key) : undefined}
                      aria-sort={
                        sortable && sortKey === key
                          ? sortDir === 'asc' ? 'ascending' : 'descending'
                          : undefined
                      }
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {sortable && (
                          <SortIcon column={key} sortKey={sortKey} sortDir={sortDir} />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {processedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-800/30 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-xs truncate">
                      {record.activity_id}
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {formatDateTime(record.start_time)}
                    </td>
                    <td className="px-4 py-3 text-amber-400 font-semibold">
                      <MissingCell value={record.speed != null ? formatSpeed(record.speed) : null} />
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <MissingCell value={record.cme_type} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      <MissingCell value={record.source_location} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer: record count + load more */}
            <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/30 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                {processedRecords.length === records.length
                  ? `Showing ${records.length} record${records.length !== 1 ? 's' : ''}`
                  : `Showing ${processedRecords.length} of ${records.length} records`}
              </p>
              {hasMore && !search && (
                <button
                  id="btn-history-load-more"
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="
                    flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-medium
                    bg-slate-800 border border-slate-700 text-slate-300
                    hover:bg-slate-700 hover:text-white
                    transition-all disabled:opacity-50
                  "
                >
                  {loadingMore
                    ? <><LoadingSpinner size="sm" className="py-0" text="" /> Loading…</>
                    : 'Load more'}
                </button>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
