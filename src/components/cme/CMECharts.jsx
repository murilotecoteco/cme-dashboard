/**
 * CMECharts — visualizes CME analysis data with two Recharts charts.
 *
 * Charts:
 *   1. Speed Over Time — LineChart of CME speed (km/s) vs. event date.
 *   2. Type Distribution — PieChart breakdown of CME types (S/C/O/R/ER).
 *
 * Renders nothing (null) when cmeAnalysis is empty or undefined.
 */
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { formatDate, formatSpeed } from '../../utils/formatters'

// ─── Chart theme tokens (matches the dark UI palette) ────────────────────────
const GRID_COLOR   = '#1e293b'
const AXIS_COLOR   = '#64748b'
const TOOLTIP_BG   = '#0f172a'
const TOOLTIP_BORDER = '#334155'

// ─── CME type → hex color (dark-mode safe) ───────────────────────────────────
const TYPE_COLORS = {
  S:  '#4ade80', // green-400
  C:  '#facc15', // yellow-400
  O:  '#fb923c', // orange-400
  R:  '#f87171', // red-400
  ER: '#c084fc', // purple-400
}
const TYPE_LABELS = {
  S:  'Slow',
  C:  'Common',
  O:  'Occasional',
  R:  'Rare',
  ER: 'Extremely Rare',
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

function SpeedTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div
      style={{
        background: TOOLTIP_BG,
        border: `1px solid ${TOOLTIP_BORDER}`,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        color: '#cbd5e1',
      }}
    >
      <p style={{ color: '#f59e0b', fontWeight: 600, marginBottom: 4 }}>
        {d.activityID}
      </p>
      <p>Date: {d.date}</p>
      <p>Speed: <strong style={{ color: '#f59e0b' }}>{formatSpeed(d.speed)}</strong></p>
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value, percent } = payload[0]
  return (
    <div
      style={{
        background: TOOLTIP_BG,
        border: `1px solid ${TOOLTIP_BORDER}`,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        color: '#cbd5e1',
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{TYPE_LABELS[name] ?? name}</p>
      <p>Count: <strong>{value}</strong></p>
      <p>Share: <strong>{(percent * 100).toFixed(1)}%</strong></p>
    </div>
  )
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

function buildSpeedData(cmeAnalysis) {
  return cmeAnalysis
    .filter((a) => a.speed != null)
    .map((a) => ({
      activityID: a.associatedCMEID ?? a.id ?? '—',
      date: formatDate(a.time21_5),
      speed: Math.round(a.speed),
      rawTime: new Date(a.time21_5 ?? 0).getTime(),
    }))
    .sort((a, b) => a.rawTime - b.rawTime)
}

function buildTypeData(cmeAnalysis) {
  const counts = {}
  cmeAnalysis.forEach((a) => {
    const t = a.type ?? 'S'
    counts[t] = (counts[t] ?? 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {{ cmeAnalysis: Array }} props
 */
export default function CMECharts({ cmeAnalysis }) {
  if (!cmeAnalysis?.length) return null

  const speedData = buildSpeedData(cmeAnalysis)
  const typeData  = buildTypeData(cmeAnalysis)

  return (
    <section aria-label="CME data charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Speed Over Time ── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">
          CME Speed Over Time
        </h3>
        <p className="text-xs text-slate-500 mb-4">km/s per event in selected range</p>
        {speedData.length === 0 ? (
          <p className="text-xs text-slate-600 py-8 text-center">No speed data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={speedData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: GRID_COLOR }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(v) => `${v.toLocaleString()}`}
              />
              <Tooltip content={<SpeedTooltip />} />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Type Distribution ── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">
          CME Type Distribution
        </h3>
        <p className="text-xs text-slate-500 mb-4">Breakdown by NASA DONKI classification</p>
        {typeData.length === 0 ? (
          <p className="text-xs text-slate-600 py-8 text-center">No type data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {typeData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={TYPE_COLORS[entry.name] ?? '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>
                    {TYPE_LABELS[value] ?? value}
                  </span>
                )}
                iconSize={10}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

    </section>
  )
}
