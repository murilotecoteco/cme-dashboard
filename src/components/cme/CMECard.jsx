/**
 * CMECard — displays a single Coronal Mass Ejection event.
 *
 * Combines data from two NASA DONKI endpoints:
 *   - CME event (activityID, startTime, sourceLocation, note, link)
 *   - CMEAnalysis (speed, halfAngle, type) — optional, may not always exist
 */
import { MapPin, Database, Check } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import {
  formatDateTime,
  formatSpeed,
  formatAngle,
  getSpeedColor,
  getSpeedCategory,
  timeAgo,
} from '../../utils/formatters'
import { CME_TYPE_LABELS, SPEED_THRESHOLDS } from '../../utils/constants'

/**
 * Pick the right Badge variant based on CME speed.
 * @param {number | null} speed
 * @returns {string}
 */
function speedVariant(speed) {
  if (!speed)                              return 'default'
  if (speed >= SPEED_THRESHOLDS.fast)     return 'danger'
  if (speed >= SPEED_THRESHOLDS.moderate) return 'plasma'
  if (speed >= SPEED_THRESHOLDS.slow)     return 'solar'
  return 'success'
}

/**
 * @param {{
 *   cme: Object,       — CME endpoint record
 *   analysis?: Object, — CMEAnalysis endpoint record (may be undefined)
 *   saved?: boolean,   — true when this event has been persisted to Supabase
 *   onSave?: (cme: Object) => void — manual save fallback
 * }} props
 */
export default function CMECard({ cme, analysis, saved = false, onSave }) {
  const speed = analysis?.speed ?? null
  const isHighSpeed = speed != null && speed >= SPEED_THRESHOLDS.moderate

  return (
    <Card glow={isHighSpeed} className="p-4 flex flex-col gap-3">

      {/* ── Header: Activity ID + type badge ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-slate-500 truncate" title={cme.activityID}>
            {cme.activityID}
          </p>
          <p className="text-slate-200 text-sm font-medium mt-0.5">
            {formatDateTime(cme.startTime)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{timeAgo(cme.startTime)}</p>
        </div>
        {analysis?.type && (
          <Badge variant={speedVariant(speed)} className="flex-shrink-0">
            {CME_TYPE_LABELS[analysis.type] ?? analysis.type}
          </Badge>
        )}
      </div>

      {/* ── Analysis: Speed + half-angle ── */}
      {analysis ? (
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Speed</p>
            <p className={`text-xl font-bold ${getSpeedColor(speed)}`}>
              {formatSpeed(speed)}
            </p>
            <p className="text-xs text-slate-500">{getSpeedCategory(speed)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Half-Angle</p>
            <p className="text-xl font-bold text-slate-300">
              {formatAngle(analysis.halfAngle)}
            </p>
            <p className="text-xs text-slate-500">Angular width</p>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 text-center">
          <p className="text-xs text-slate-500">Analysis data not available</p>
        </div>
      )}

      {/* ── Source location + active region ── */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin size={11} aria-hidden="true" />
          {cme.sourceLocation ? (
            cme.sourceLocation
          ) : (
            <span
              className="cursor-help border-b border-dotted border-slate-600"
              title="NASA did not report this value for this event"
            >
              Unknown location
            </span>
          )}
        </span>
        {cme.activeRegionNum && (
          <span className="font-mono text-slate-400">AR {cme.activeRegionNum}</span>
        )}
      </div>

      {/* ── Optional note ── */}
      {cme.note && (
        <p className="text-xs text-slate-500 line-clamp-2 border-t border-slate-800 pt-2 leading-relaxed">
          {cme.note}
        </p>
      )}

      {/* ── Footer row: DONKI link + save status ── */}
      <div className="flex items-center justify-between mt-auto gap-2">
        {cme.link ? (
          <a
            href={cme.link}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-1 text-xs
              text-amber-400/60 hover:text-amber-400
              transition-colors duration-200
            "
          >
            View on NASA DONKI →
          </a>
        ) : <span />}

        {/* Supabase sync indicator */}
        {saved ? (
          <span className="
            inline-flex items-center gap-1 text-xs px-2 py-0.5
            rounded-full bg-emerald-500/10 border border-emerald-400/20
            text-emerald-400 font-medium flex-shrink-0
          ">
            <Check size={11} aria-hidden="true" />
            Saved
          </span>
        ) : onSave ? (
          <button
            type="button"
            onClick={() => onSave(cme)}
            className="
              inline-flex items-center gap-1 text-xs px-2 py-0.5
              rounded-full bg-slate-700/50 border border-slate-600/30
              text-slate-400 hover:text-slate-200 hover:bg-slate-700
              transition-all duration-150 flex-shrink-0
            "
          >
            <Database size={11} aria-hidden="true" />
            Save
          </button>
        ) : null}
      </div>

    </Card>
  )
}
