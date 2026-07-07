/**
 * Card — glassmorphism container used throughout the dashboard.
 *
 * Variants:
 *   default — subtle dark glass panel
 *   glow    — adds an amber glow for high-speed / critical events
 */

/**
 * @param {{
 *   children: React.ReactNode,
 *   className?: string,
 *   glow?: boolean,
 *   onClick?: () => void,
 * }} props
 */
export default function Card({ children, className = '', glow = false, onClick }) {
  const isInteractive = typeof onClick === 'function'

  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`
        relative rounded-xl
        border border-slate-700/50
        bg-slate-900/50 backdrop-blur-sm
        transition-all duration-300
        ${glow
          ? 'shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:border-amber-500/30'
          : 'hover:border-slate-600/70'
        }
        ${isInteractive ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
