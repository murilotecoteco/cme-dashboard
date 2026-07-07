/**
 * Unit tests for src/utils/constants.js
 * Verifies structural invariants that other parts of the app depend on.
 */
import { describe, it, expect } from 'vitest'
import {
  SPEED_THRESHOLDS,
  CME_TYPE_LABELS,
  CME_TYPE_COLORS,
  FLARE_CLASS_COLORS,
  STORM_LEVELS,
  NAV_ITEMS,
} from '../constants'

// ─── SPEED_THRESHOLDS ─────────────────────────────────────────────────────────

describe('SPEED_THRESHOLDS', () => {
  it('has the four required keys', () => {
    expect(SPEED_THRESHOLDS).toHaveProperty('slow')
    expect(SPEED_THRESHOLDS).toHaveProperty('moderate')
    expect(SPEED_THRESHOLDS).toHaveProperty('fast')
    expect(SPEED_THRESHOLDS).toHaveProperty('extreme')
  })
  it('thresholds are in ascending order', () => {
    const { slow, moderate, fast, extreme } = SPEED_THRESHOLDS
    expect(slow).toBeLessThan(moderate)
    expect(moderate).toBeLessThan(fast)
    expect(fast).toBeLessThan(extreme)
  })
})

// ─── CME_TYPE_LABELS ──────────────────────────────────────────────────────────

describe('CME_TYPE_LABELS', () => {
  it('contains all five NASA DONKI type codes', () => {
    expect(Object.keys(CME_TYPE_LABELS)).toEqual(
      expect.arrayContaining(['S', 'C', 'O', 'R', 'ER'])
    )
  })
  it('values are non-empty strings', () => {
    Object.values(CME_TYPE_LABELS).forEach((label) => {
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    })
  })
})

// ─── CME_TYPE_COLORS ──────────────────────────────────────────────────────────

describe('CME_TYPE_COLORS', () => {
  it('has an entry for every key in CME_TYPE_LABELS', () => {
    Object.keys(CME_TYPE_LABELS).forEach((key) => {
      expect(CME_TYPE_COLORS).toHaveProperty(key)
    })
  })
})

// ─── FLARE_CLASS_COLORS ───────────────────────────────────────────────────────

describe('FLARE_CLASS_COLORS', () => {
  it('covers A, B, C, M, X classes', () => {
    ;['A', 'B', 'C', 'M', 'X'].forEach((cls) => {
      expect(FLARE_CLASS_COLORS).toHaveProperty(cls)
    })
  })
})

// ─── STORM_LEVELS ─────────────────────────────────────────────────────────────

describe('STORM_LEVELS', () => {
  it('is sorted in descending order of minKp', () => {
    for (let i = 0; i < STORM_LEVELS.length - 1; i++) {
      expect(STORM_LEVELS[i].minKp).toBeGreaterThan(STORM_LEVELS[i + 1].minKp)
    }
  })
  it('last entry has minKp of 0 (catch-all quiet level)', () => {
    expect(STORM_LEVELS.at(-1).minKp).toBe(0)
  })
  it('each level has label, color and bg properties', () => {
    STORM_LEVELS.forEach((level) => {
      expect(level).toHaveProperty('label')
      expect(level).toHaveProperty('color')
      expect(level).toHaveProperty('bg')
    })
  })
})

// ─── NAV_ITEMS ────────────────────────────────────────────────────────────────

describe('NAV_ITEMS', () => {
  it('has exactly three navigation items', () => {
    expect(NAV_ITEMS).toHaveLength(3)
  })
  it('each item has id and label', () => {
    NAV_ITEMS.forEach((item) => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('label')
    })
  })
  it('includes dashboard, history and about', () => {
    const ids = NAV_ITEMS.map((i) => i.id)
    expect(ids).toContain('dashboard')
    expect(ids).toContain('history')
    expect(ids).toContain('about')
  })
})
