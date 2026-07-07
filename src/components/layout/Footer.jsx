/**
 * Footer — minimal footer with attribution links.
 * Pushed to the bottom of the viewport by the flex-1 main element in App.jsx.
 */
import { Sun } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-slate-800/60 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">

          {/* Attribution */}
          <div className="flex items-center gap-2">
            <Sun size={14} className="text-amber-400/60" aria-hidden="true" />
            <span>
              Solar CME Monitor &copy; {year} — Powered by{' '}
              <a
                href="https://kauai.ccmc.gsfc.nasa.gov/DONKI/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-amber-400 transition-colors"
              >
                NASA DONKI API
              </a>
            </span>
          </div>

          {/* Links */}
          <nav aria-label="Footer links">
            <ul className="flex items-center gap-4 list-none m-0 p-0">
              <li>
                <a
                  href="https://api.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  Get API Key
                </a>
              </li>
              <li>
                <a
                  href="https://supabase.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  Supabase
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/murilotecoteco/nasa-cme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </nav>

        </div>
      </div>
    </footer>
  )
}
