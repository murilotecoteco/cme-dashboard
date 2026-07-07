/**
 * Badge — small inline label for event types, flare classes, storm levels, etc.
 * Uses predefined semantic variants to maintain visual consistency.
 */

const VARIANTS = {
  default: 'bg-slate-700/60 text-slate-300 border-slate-600/50',
  solar:   'bg-amber-500/10  text-amber-400  border-amber-400/30',
  plasma:  'bg-orange-500/10 text-orange-400 border-orange-400/30',
  corona:  'bg-purple-500/10 text-purple-400 border-purple-400/30',
  danger:  'bg-red-500/10    text-red-400    border-red-400/30',
  success: 'bg-green-500/10  text-green-400  border-green-400/30',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30',
  info:    'bg-blue-500/10   text-blue-400   border-blue-400/30',
}

/**
 * @param {{
 *   children: React.ReactNode,
 *   variant?: keyof typeof VARIANTS,
 *   className?: string,
 * }} props
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  const variantClasses = VARIANTS[variant] ?? VARIANTS.default
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        rounded text-xs font-medium border
        ${variantClasses} ${className}
      `}
    >
      {children}
    </span>
  )
}
