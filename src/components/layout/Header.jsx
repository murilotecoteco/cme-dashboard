/**
 * Header — sticky top navigation bar.
 * Contains the app logo/brand and tab navigation between pages.
 */
import { Sun } from 'lucide-react'
import { NAV_ITEMS } from '../../utils/constants'

/**
 * @param {{
 *   activePage: string,
 *   onNavigate: (pageId: string) => void,
 * }} props
 */
export default function Header({ activePage, onNavigate }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <div className="
              w-8 h-8 rounded-full flex items-center justify-center
              bg-gradient-to-br from-amber-400 to-orange-500
              shadow-lg shadow-amber-500/30
            ">
              <Sun size={16} className="text-white" aria-hidden="true" />
            </div>
            <div className="leading-none">
              <p className="text-white font-bold text-sm">Solar CME Monitor</p>
              <p className="text-slate-500 text-xs mt-0.5">NASA DONKI API</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-1 list-none m-0 p-0">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id
                return (
                  <li key={item.id}>
                    <button
                      id={`nav-${item.id}`}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg
                        text-sm font-medium transition-all duration-200
                        ${isActive
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-400/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                        }
                      `}
                    >
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

        </div>
      </div>
    </header>
  )
}
