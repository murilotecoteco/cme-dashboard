/**
 * CMEFilters — date range, speed threshold, and CME type filters for the Dashboard.
 * All state is controlled by the parent (useFilters hook).
 */
import { X } from 'lucide-react'
import { CME_TYPE_LABELS } from '../../utils/constants'

const CME_TYPES = ['ALL', 'S', 'C', 'O', 'R', 'ER']

// Shared input class for all form controls
const inputClass = `
  px-3 py-2 rounded-lg text-sm
  bg-slate-800 border border-slate-700 text-slate-200
  focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20
  transition-colors duration-200
`

/**
 * @param {{
 *   startDate: string,
 *   endDate: string,
 *   minSpeed: number,
 *   cmeType: string,
 *   onStartDate: (v: string) => void,
 *   onEndDate: (v: string) => void,
 *   onMinSpeed: (v: number) => void,
 *   onCmeType: (v: string) => void,
 * }} props
 */
export default function CMEFilters({
  startDate,
  endDate,
  minSpeed,
  cmeType,
  onStartDate,
  onEndDate,
  onMinSpeed,
  onCmeType,
}) {
  return (
    <div className="flex flex-wrap gap-4 items-end">

      {/* Start Date */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-start" className="text-xs text-slate-400 font-medium">
          Start Date
        </label>
        <input
          id="filter-start"
          type="date"
          value={startDate}
          onChange={(e) => onStartDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* End Date */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-end" className="text-xs text-slate-400 font-medium">
          End Date
        </label>
        <input
          id="filter-end"
          type="date"
          value={endDate}
          onChange={(e) => onEndDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Min Speed */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-speed" className="text-xs text-slate-400 font-medium">
          Min Speed (km/s)
        </label>
        <input
          id="filter-speed"
          type="number"
          value={minSpeed}
          min={0}
          step={100}
          placeholder="0"
          onChange={(e) => onMinSpeed(Number(e.target.value))}
          className={`${inputClass} w-36`}
        />
      </div>

      {/* CME Type */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-type" className="text-xs text-slate-400 font-medium">
          CME Type
        </label>
        <select
          id="filter-type"
          value={cmeType}
          onChange={(e) => onCmeType(e.target.value)}
          className={inputClass}
        >
          {CME_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === 'ALL' ? 'All Types' : `${t} — ${CME_TYPE_LABELS[t] ?? t}`}
            </option>
          ))}
        </select>
      </div>

      {/* Reset button */}
      {(minSpeed > 0 || cmeType !== 'ALL') && (
        <button
          type="button"
          onClick={() => { onMinSpeed(0); onCmeType('ALL') }}
          className="
            mb-0 px-3 py-2 rounded-lg text-xs font-medium
            text-slate-400 border border-slate-700
            hover:bg-slate-800 hover:text-slate-200
            transition-colors duration-200 flex items-center gap-1.5
          "
        >
          <X size={12} aria-hidden="true" />
          Clear filters
        </button>
      )}

    </div>
  )
}
