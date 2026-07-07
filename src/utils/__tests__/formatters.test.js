/**
 * Unit tests for src/utils/formatters.js
 * Pure functions only — no fetch, no Supabase, no React.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDate,
  formatDateTime,
  timeAgo,
  formatSpeed,
  getSpeedCategory,
  getSpeedColor,
  formatAngle,
  getFlareClass,
  getMaxKp,
} from '../formatters'

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a valid ISO string to a readable date', () => {
    // Use noon UTC to avoid timezone-induced date shift across midnight
    expect(formatDate('2026-07-06T12:00:00Z')).toMatch(/Jul\s+6,\s+2026/)
  })
  it('returns "Unknown" for null', () => {
    expect(formatDate(null)).toBe('Unknown')
  })
  it('returns "Unknown" for undefined', () => {
    expect(formatDate(undefined)).toBe('Unknown')
  })
})

// ─── formatDateTime ───────────────────────────────────────────────────────────

describe('formatDateTime', () => {
  it('includes the year, month, day and timezone abbreviation', () => {
    const result = formatDateTime('2026-07-06T12:00:00Z')
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/Jul/)
    expect(result).toMatch(/UTC/)
  })
  it('returns "Unknown" for null', () => {
    expect(formatDateTime(null)).toBe('Unknown')
  })
})

// ─── timeAgo ──────────────────────────────────────────────────────────────────

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-07T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns "Just now" for times within the last minute', () => {
    expect(timeAgo('2026-07-07T11:59:30Z')).toBe('Just now')
  })
  it('returns minutes ago', () => {
    expect(timeAgo('2026-07-07T11:45:00Z')).toBe('15m ago')
  })
  it('returns hours ago', () => {
    expect(timeAgo('2026-07-07T08:00:00Z')).toBe('4h ago')
  })
  it('returns days ago', () => {
    expect(timeAgo('2026-07-05T12:00:00Z')).toBe('2d ago')
  })
  it('returns "Unknown" for null', () => {
    expect(timeAgo(null)).toBe('Unknown')
  })
})

// ─── formatSpeed ──────────────────────────────────────────────────────────────

describe('formatSpeed', () => {
  it('formats an integer speed', () => {
    expect(formatSpeed(684)).toBe('684 km/s')
  })
  it('formats a large speed — contains the number and unit', () => {
    // toLocaleString uses ',' in en-US and '.' in pt-BR; match either
    expect(formatSpeed(1236)).toMatch(/1[,.]236 km\/s/)
  })
  it('rounds a decimal speed', () => {
    expect(formatSpeed(500.7)).toBe('501 km/s')
  })
  it('returns "N/A" for null', () => {
    expect(formatSpeed(null)).toBe('N/A')
  })
  it('returns "N/A" for undefined', () => {
    expect(formatSpeed(undefined)).toBe('N/A')
  })
})

// ─── getSpeedCategory ─────────────────────────────────────────────────────────

describe('getSpeedCategory', () => {
  it('returns "Slow" below 500 km/s', () => {
    expect(getSpeedCategory(200)).toBe('Slow')
  })
  it('returns "Moderate" between 500–999 km/s', () => {
    expect(getSpeedCategory(750)).toBe('Moderate')
  })
  it('returns "Fast" between 1000–1499 km/s', () => {
    expect(getSpeedCategory(1200)).toBe('Fast')
  })
  it('returns "Extreme" between 1500–1999 km/s', () => {
    expect(getSpeedCategory(1800)).toBe('Extreme')
  })
  it('returns "Ultra-Extreme" at 2000+ km/s', () => {
    expect(getSpeedCategory(2500)).toBe('Ultra-Extreme')
  })
  it('returns "Unknown" for null', () => {
    expect(getSpeedCategory(null)).toBe('Unknown')
  })
})

// ─── getSpeedColor ────────────────────────────────────────────────────────────

describe('getSpeedColor', () => {
  it('returns slate for null', () => {
    expect(getSpeedColor(null)).toBe('text-slate-400')
  })
  it('returns green for slow speeds', () => {
    expect(getSpeedColor(300)).toBe('text-green-400')
  })
  it('returns red for extreme speeds', () => {
    expect(getSpeedColor(2000)).toBe('text-red-400')
  })
})

// ─── formatAngle ──────────────────────────────────────────────────────────────

describe('formatAngle', () => {
  it('formats angle with degree symbol', () => {
    expect(formatAngle(45)).toBe('45°')
  })
  it('returns "N/A" for null', () => {
    expect(formatAngle(null)).toBe('N/A')
  })
})

// ─── getFlareClass ────────────────────────────────────────────────────────────

describe('getFlareClass', () => {
  it('extracts the first letter and uppercases it', () => {
    expect(getFlareClass('M5.1')).toBe('M')
    expect(getFlareClass('x3.2')).toBe('X')
    expect(getFlareClass('C1.0')).toBe('C')
  })
  it('returns "?" for null', () => {
    expect(getFlareClass(null)).toBe('?')
  })
})

// ─── getMaxKp ─────────────────────────────────────────────────────────────────

describe('getMaxKp', () => {
  it('returns the maximum kpIndex value', () => {
    const gst = { allKpIndex: [{ kpIndex: 5 }, { kpIndex: 8 }, { kpIndex: 3 }] }
    expect(getMaxKp(gst)).toBe(8)
  })
  it('returns 0 for an empty array', () => {
    expect(getMaxKp({ allKpIndex: [] })).toBe(0)
  })
  it('returns 0 for null input', () => {
    expect(getMaxKp(null)).toBe(0)
  })
})
