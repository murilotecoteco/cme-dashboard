/**
 * CMEList — renders a responsive grid of CMECard components.
 *
 * Handles loading, error, and empty states so CMECard stays simple.
 * Matches CME events to their CMEAnalysis data by activityID.
 */
import { AlertTriangle, Inbox } from 'lucide-react'
import CMECard from './CMECard'
import LoadingSpinner from '../ui/LoadingSpinner'
import { matchAnalysis } from '../../utils/matchAnalysis'

// Analysis matching is handled by the shared matchAnalysis utility
// (exact ID match with time-proximity fallback). See utils/matchAnalysis.js.

/**
 * @param {{
 *   cmeData: Array,
 *   cmeAnalysis: Array,
 *   loading: boolean,
 *   error: string | null,
 *   savedIds?: Set<string>,
 *   onManualSave?: (cme: Object) => void,
 * }} props
 */
export default function CMEList({
  cmeData = [],
  cmeAnalysis = [],
  loading,
  error,
  savedIds,
  onManualSave,
}) {
  // ── Loading ──
  if (loading) {
    return <LoadingSpinner text="Fetching CME data from NASA DONKI…" />
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-400/30 flex items-center justify-center text-red-400">
          <AlertTriangle size={28} aria-hidden="true" />
        </div>
        <div>
          <p className="text-red-400 font-semibold">Failed to fetch data</p>
          <p className="text-slate-500 text-sm mt-1 max-w-md">{error}</p>
        </div>
      </div>
    )
  }

  // ── Empty ──
  if (!cmeData.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
          <Inbox size={28} aria-hidden="true" />
        </div>
        <div>
          <p className="text-slate-300 font-semibold">No CME events found</p>
          <p className="text-slate-500 text-sm mt-1">
            Try adjusting the date range or clearing the speed filter
          </p>
        </div>
      </div>
    )
  }

  // ── Sort newest first, then render ──
  const sorted = [...cmeData].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime)
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sorted.map((cme) => (
        <CMECard
          key={cme.activityID}
          cme={cme}
          analysis={matchAnalysis(cmeAnalysis, cme.activityID, cme.startTime)}
          saved={savedIds?.has(cme.activityID) ?? false}
          onSave={onManualSave}
        />
      ))}
    </div>
  )
}
