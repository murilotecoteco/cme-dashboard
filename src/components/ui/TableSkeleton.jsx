/**
 * TableSkeleton — animated shimmer placeholder matching the 5-column
 * History table layout (Activity ID, Start Time, Speed, Type, Location).
 *
 * Shown on the initial load of the History page before any records arrive.
 */

/** Single shimmer cell */
function ShimmerCell({ width = 'w-full' }) {
  return (
    <td className="px-4 py-3">
      <div className={`h-3 rounded-full bg-slate-700/60 animate-pulse ${width}`} />
    </td>
  )
}

/** One skeleton row */
function SkeletonRow({ index }) {
  // Vary widths slightly so rows don't look identical
  const widths = [
    ['w-48', 'w-28', 'w-16', 'w-12', 'w-20'],
    ['w-44', 'w-32', 'w-14', 'w-16', 'w-12'],
    ['w-52', 'w-28', 'w-20', 'w-10', 'w-24'],
  ]
  const [c0, c1, c2, c3, c4] = widths[index % widths.length]

  return (
    <tr className="border-b border-slate-800/60">
      <ShimmerCell width={c0} />
      <ShimmerCell width={c1} />
      <ShimmerCell width={c2} />
      <ShimmerCell width={c3} />
      <ShimmerCell width={c4} />
    </tr>
  )
}

/**
 * @param {{ rows?: number }} props
 */
export default function TableSkeleton({ rows = 8 }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-900/70">
            {['Activity ID', 'Start Time', 'Speed', 'Type', 'Location'].map((col) => (
              <th
                key={col}
                className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wide"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
