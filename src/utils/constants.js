/**
 * Application-wide constants for the Solar CME Monitor.
 * Import specific values rather than the whole module to keep bundles lean.
 */

// ─── API ──────────────────────────────────────────────────────────────────────

export const NASA_DONKI_BASE = 'https://api.nasa.gov/DONKI'
export const DEFAULT_DAYS_RANGE = 30

// ─── CME Type Classification ─────────────────────────────────────────────────
// Sourced from NASA DONKI type field values

export const CME_TYPE_LABELS = {
  S: 'Slow',
  C: 'Common',
  O: 'Occasional',
  R: 'Rare',
  ER: 'Extremely Rare',
}

/** Tailwind class strings for CME type badges */
export const CME_TYPE_COLORS = {
  S: 'text-green-400 bg-green-400/10 border-green-400/30',
  C: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  O: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  R: 'text-red-400 bg-red-400/10 border-red-400/30',
  ER: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
}

// ─── Solar Flare Classification ───────────────────────────────────────────────
// A < B < C < M < X in order of increasing intensity

/** Tailwind class strings for solar flare class badges */
export const FLARE_CLASS_COLORS = {
  A: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
  B: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  C: 'text-green-400 bg-green-400/10 border-green-400/30',
  M: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  X: 'text-red-400 bg-red-400/10 border-red-400/30',
}

// ─── CME Speed Thresholds (km/s) ─────────────────────────────────────────────

export const SPEED_THRESHOLDS = {
  slow: 500,
  moderate: 1000,
  fast: 1500,
  extreme: 2000,
}

// ─── Geomagnetic Storm — Kp Index Scale ──────────────────────────────────────
// G1 (minor) → G5 (extreme), triggered by Kp index level

export const STORM_LEVELS = [
  { minKp: 9, label: 'G5 Extreme',   color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { minKp: 8, label: 'G4 Severe',    color: 'text-red-400',    bg: 'bg-red-400/10' },
  { minKp: 7, label: 'G3 Strong',    color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { minKp: 6, label: 'G2 Moderate',  color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { minKp: 5, label: 'G1 Minor',     color: 'text-green-400',  bg: 'bg-green-400/10' },
  { minKp: 0, label: 'Quiet',        color: 'text-slate-400',  bg: 'bg-slate-400/10' },
]

// ─── Navigation Pages ─────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'history',   label: 'History'   },
  { id: 'about',     label: 'About'     },
]
