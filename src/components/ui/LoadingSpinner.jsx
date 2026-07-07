/**
 * LoadingSpinner — animated spinner with optional label text.
 * Used during API fetches to give visual feedback.
 */

const SIZES = {
  sm: 'w-4 h-4 border',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-2',
}

/**
 * @param {{
 *   size?: 'sm' | 'md' | 'lg',
 *   text?: string,
 *   className?: string,
 * }} props
 */
export default function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}
      role="status"
      aria-label={text}
    >
      {/* Spinner ring */}
      <div
        className={`
          ${SIZES[size]}
          animate-spin rounded-full
          border-slate-700 border-t-amber-400
        `}
      />

      {/* Label */}
      {text && (
        <p className="text-slate-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  )
}
