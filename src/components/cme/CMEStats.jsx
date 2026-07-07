/**
 * CMEStats — summary statistics panel shown at the top of the Dashboard.
 * Aggregates data from all 4 NASA DONKI endpoints into key metrics.
 */
import { Wind, Zap, Flame, Magnet } from 'lucide-react'
import Card from '../ui/Card'

/**
 * Individual metric card inside the stats panel.
 */
function StatCard({ label, value, sub, icon: Icon, color = 'text-amber-400' }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{sub}</p>
          )}
        </div>
        <span className="text-slate-600 opacity-70 flex-shrink-0 mt-0.5" aria-hidden="true">
          <Icon size={20} />
        </span>
      </div>
    </Card>
  )
}

/**
 * @param {{
 *   data: {
 *     cme: Array,
 *     cmeAnalysis: Array,
 *     gst: Array,
 *     flr: Array,
 *   }
 * }} props
 */
export default function CMEStats({ data }) {
  const { cme = [], cmeAnalysis = [], gst = [], flr = [] } = data

  // Average speed from analyses that have a speed value
  const speedValues = cmeAnalysis.map((a) => a.speed).filter((s) => s != null)
  const avgSpeed = speedValues.length
    ? Math.round(speedValues.reduce((s, v) => s + v, 0) / speedValues.length)
    : null
  const maxSpeed = speedValues.length ? Math.max(...speedValues) : null

  // Flare class counts
  const xFlares = flr.filter((f) => f.classType?.startsWith('X')).length
  const mFlares = flr.filter((f) => f.classType?.startsWith('M')).length

  // Max Kp index across all storm events
  const allKpValues = gst.flatMap((g) => g.allKpIndex?.map((k) => k.kpIndex) ?? [])
  const maxKp = allKpValues.length ? Math.max(...allKpValues) : null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="CME Events"
        value={cme.length}
        sub={cmeAnalysis.length ? `${cmeAnalysis.length} with analysis` : 'No analysis data'}
        icon={Wind}
        color="text-amber-400"
      />
      <StatCard
        label="Avg Speed"
        value={avgSpeed != null ? avgSpeed.toLocaleString() : '—'}
        sub={avgSpeed != null
          ? `km/s · max ${maxSpeed?.toLocaleString()} km/s`
          : 'No speed data'}
        icon={Zap}
        color="text-orange-400"
      />
      <StatCard
        label="Solar Flares"
        value={flr.length}
        sub={flr.length
          ? `${xFlares} X-class · ${mFlares} M-class`
          : 'No flares detected'}
        icon={Flame}
        color="text-yellow-400"
      />
      <StatCard
        label="Geo Storms"
        value={gst.length}
        sub={maxKp != null ? `Peak Kp index: ${maxKp}` : 'No storms recorded'}
        icon={Magnet}
        color="text-purple-400"
      />
    </div>
  )
}
