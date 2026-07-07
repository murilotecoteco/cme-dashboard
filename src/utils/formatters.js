/**
 * Formatting utilities for Solar CME Monitor.
 * All functions are pure — no side effects, no imports from the app.
 */

import { SPEED_THRESHOLDS, STORM_LEVELS } from './constants'

// ─── Date / Time ──────────────────────────────────────────────────────────────

/**
 * Format an ISO string to a short date: "Jul 6, 2026"
 * @param {string | null} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  if (!isoString) return 'Unknown'
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format an ISO string to date + time with timezone: "Jul 6, 2026, 10:30 AM UTC"
 * @param {string | null} isoString
 * @returns {string}
 */
export function formatDateTime(isoString) {
  if (!isoString) return 'Unknown'
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
}

/**
 * Human-readable relative time: "3d ago", "5h ago", "Just now"
 * @param {string | null} isoString
 * @returns {string}
 */
export function timeAgo(isoString) {
  if (!isoString) return 'Unknown'
  const diffMs = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor(diffMs / (1000 * 60))
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

// ─── CME Speed ────────────────────────────────────────────────────────────────

/**
 * Format speed as "1,234 km/s" or "N/A"
 * @param {number | null | undefined} speed
 * @returns {string}
 */
export function formatSpeed(speed) {
  if (speed == null) return 'N/A'
  return `${Math.round(speed).toLocaleString()} km/s`
}

/**
 * Categorize CME speed into a human-readable label.
 * @param {number | null | undefined} speed km/s
 * @returns {string}
 */
export function getSpeedCategory(speed) {
  if (speed == null) return 'Unknown'
  if (speed < SPEED_THRESHOLDS.slow)     return 'Slow'
  if (speed < SPEED_THRESHOLDS.moderate) return 'Moderate'
  if (speed < SPEED_THRESHOLDS.fast)     return 'Fast'
  if (speed < SPEED_THRESHOLDS.extreme)  return 'Extreme'
  return 'Ultra-Extreme'
}

/**
 * Get a Tailwind text-color class based on CME speed.
 * @param {number | null | undefined} speed km/s
 * @returns {string}
 */
export function getSpeedColor(speed) {
  if (speed == null)                     return 'text-slate-400'
  if (speed < SPEED_THRESHOLDS.slow)     return 'text-green-400'
  if (speed < SPEED_THRESHOLDS.moderate) return 'text-yellow-400'
  if (speed < SPEED_THRESHOLDS.fast)     return 'text-orange-400'
  return 'text-red-400'
}

// ─── CME Angle ───────────────────────────────────────────────────────────────

/**
 * Format half-angle as "45°" or "N/A"
 * @param {number | null | undefined} angle degrees
 * @returns {string}
 */
export function formatAngle(angle) {
  if (angle == null) return 'N/A'
  return `${angle}°`
}

// ─── Solar Flares ─────────────────────────────────────────────────────────────

/**
 * Extract the class letter (C, M, X) from a flare classType string like "M5.1"
 * @param {string | null | undefined} classType
 * @returns {string}
 */
export function getFlareClass(classType) {
  if (!classType) return '?'
  return classType.charAt(0).toUpperCase()
}

// ─── Geomagnetic Storms ───────────────────────────────────────────────────────

/**
 * Get the storm level object for a given Kp index.
 * @param {number} kpIndex
 * @returns {{ minKp: number, label: string, color: string, bg: string }}
 */
export function getStormLevel(kpIndex) {
  return STORM_LEVELS.find((level) => kpIndex >= level.minKp) ?? STORM_LEVELS.at(-1)
}

/**
 * Find the maximum Kp index across all readings in a GST event.
 * @param {Object} gstEvent
 * @returns {number}
 */
export function getMaxKp(gstEvent) {
  if (!gstEvent?.allKpIndex?.length) return 0
  return Math.max(...gstEvent.allKpIndex.map((k) => k.kpIndex ?? 0))
}
