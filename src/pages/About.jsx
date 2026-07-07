/**
 * About — project information, API documentation, and tech stack overview.
 */
import {
  Atom,
  Zap,
  Paintbrush,
  Rocket,
  Database,
  FileText,
  Triangle,
  Key,
  Satellite,
  FolderGit2,
} from 'lucide-react'
import Card from '../components/ui/Card'

const API_ENDPOINTS = [
  {
    name: 'CME',
    path: '/DONKI/CME',
    desc: 'Coronal Mass Ejections — massive plasma bursts from the Sun\'s corona',
    docs: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/help/CME',
  },
  {
    name: 'CMEAnalysis',
    path: '/DONKI/CMEAnalysis',
    desc: 'Speed (km/s), half-angle, and type classification for each CME event',
    docs: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/help/CMEAnalysis',
  },
  {
    name: 'GST',
    path: '/DONKI/GST',
    desc: 'Geomagnetic Storms — Kp index readings (G1 Minor → G5 Extreme)',
    docs: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/help/GST',
  },
  {
    name: 'FLR',
    path: '/DONKI/FLR',
    desc: 'Solar Flares — class type (C/M/X), peak time, and linked CMEs',
    docs: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/help/FLR',
  },
]

const TECH_STACK = [
  { name: 'React 19',          Icon: Atom,      desc: 'UI framework with concurrent features' },
  { name: 'Vite 8',            Icon: Zap,       desc: 'Ultra-fast dev server and build tool' },
  { name: 'Tailwind CSS v4',   Icon: Paintbrush, desc: 'Utility-first CSS with native Vite plugin' },
  { name: 'NASA DONKI API',    Icon: Rocket,    desc: 'Space weather event database (free API key)' },
  { name: 'Supabase',          Icon: Database,  desc: 'PostgreSQL for CME event persistence' },
  { name: 'GitHub Pages',      Icon: FileText,  desc: 'Static hosting via gh-pages branch' },
  { name: 'Vercel',            Icon: Triangle,  desc: 'Primary production deployment' },
]

const RESOURCES = [
  { label: 'Get NASA API Key',   Icon: Key,        href: 'https://api.nasa.gov/',                     variant: 'solar'   },
  { label: 'DONKI Portal',       Icon: Satellite,  href: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',   variant: 'default' },
  { label: 'GitHub Repository',  Icon: FolderGit2, href: 'https://github.com/murilotecoteco/nasa-cme', variant: 'default' },
  { label: 'Supabase Dashboard', Icon: Database,   href: 'https://supabase.com/dashboard',             variant: 'corona'  },
]

const VARIANT_CLASSES = {
  solar:   'bg-amber-500/10 border-amber-400/20 text-amber-400 hover:bg-amber-500/20',
  corona:  'bg-purple-500/10 border-purple-400/20 text-purple-400 hover:bg-purple-500/20',
  default: 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700',
}

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* ── Hero ── */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-3">About Solar CME Monitor</h2>
        <p className="text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Solar CME Monitor</strong> tracks Coronal Mass Ejections
          (CMEs) — massive bursts of magnetized plasma that erupt from the Sun. When Earth-directed,
          they can trigger geomagnetic storms (G1–G5), cause vivid aurora displays at mid-latitudes,
          and disrupt power grids, satellites, and radio communications.
        </p>
        <p className="text-slate-400 leading-relaxed mt-3">
          All data is sourced in real-time from the{' '}
          <a
            href="https://kauai.ccmc.gsfc.nasa.gov/DONKI/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            NASA DONKI API
          </a>{' '}
          (Space Weather Database Of Notifications, Knowledge, Information) and optionally
          persisted in a <strong className="text-slate-200">Supabase PostgreSQL</strong> database.
        </p>
      </section>

      {/* ── API Endpoints ── */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">NASA DONKI Endpoints Used</h3>
        <div className="space-y-2">
          {API_ENDPOINTS.map((ep) => (
            <Card key={ep.name} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <a
                  href={ep.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-amber-400 text-xs font-mono
                    bg-amber-400/5 px-2 py-1 rounded border border-amber-400/20
                    hover:bg-amber-400/10 transition-colors flex-shrink-0
                  "
                >
                  {ep.path}
                </a>
                <div>
                  <span className="font-medium text-slate-200 text-sm">{ep.name}</span>
                  <span className="text-slate-400 text-sm"> — {ep.desc}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Tech Stack</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TECH_STACK.map(({ name, Icon, desc }) => (
            <Card key={name} className="p-4 flex items-start gap-3">
              <span className="text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true">
                <Icon size={18} />
              </span>
              <div>
                <p className="font-semibold text-slate-200 text-sm">{name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Resources ── */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Resources &amp; Links</h3>
        <div className="flex flex-wrap gap-3">
          {RESOURCES.map(({ label, Icon, href, variant }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                px-4 py-2 rounded-lg text-sm font-medium border
                transition-colors duration-200 flex items-center gap-2
                ${VARIANT_CLASSES[variant]}
              `}
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </section>

    </div>
  )
}
