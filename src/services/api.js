/**
 * NASA DONKI API Client
 * Documentation: https://kauai.ccmc.gsfc.nasa.gov/DONKI/
 *
 * Fetch strategy (in priority order):
 *   1. Supabase Edge Function proxy (`/functions/v1/donki-proxy`)
 *      — keeps the NASA API key server-side, adds a 15-minute Postgres cache.
 *        Set VITE_SUPABASE_URL to enable this path automatically.
 *   2. Direct NASA DONKI API
 *      — used when Supabase is not configured, or as a fallback if the proxy
 *        fails. Uses VITE_NASA_API_KEY (falls back to 'DEMO_KEY').
 *
 * The proxy path returns { cme, cmeAnalysis, gst, flr } in a single request.
 * The direct path makes 4 parallel requests (one per endpoint).
 */

// ─── Direct-call config (fallback / dev without proxy) ───────────────────────

const NASA_BASE_URL = 'https://api.nasa.gov/DONKI'
const NASA_API_KEY  = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'

// ─── Proxy config ─────────────────────────────────────────────────────────────

/**
 * Sanitize an env var value: trims whitespace/invisible chars and strips
 * anything outside the ISO-8859-1 range (smart quotes, zero-width spaces,
 * etc. sometimes get pasted into .env files and silently break fetch headers,
 * throwing "String contains non ISO-8859-1 code point").
 * @param {string | undefined} value
 * @returns {string}
 */
function sanitizeHeaderValue(value) {
  if (!value) return ''
  return value
    // Real UTF-8 BOM codepoint, wherever it landed (usually the very start).
    .replace(/\uFEFF/g, '')
    // Same BOM, but mis-decoded as 3 separate Latin-1 chars ("ï»¿") — happens
    // when a .env file saved with a UTF-8 BOM (common on Windows/Notepad) gets
    // read/copied through a Latin-1-assuming step. Each of those 3 chars is
    // itself a valid Latin-1 codepoint, so the range filter below won't catch
    // them — they have to be stripped explicitly, as a literal sequence.
    // eslint-disable-next-line no-control-regex
    .replace(/\u00EF\u00BB\u00BF/g, '')
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\xFF]/g, '')
}

const SUPABASE_ANON_KEY = sanitizeHeaderValue(import.meta.env.VITE_SUPABASE_ANON_KEY)

/**
 * Build the proxy URL from VITE_SUPABASE_URL.
 * Returns null when Supabase is not configured, or when the anon key is
 * missing/invalid, so we fall through to direct calls instead of throwing
 * on a malformed request.
 */
const PROXY_BASE_URL = (() => {
  const url = sanitizeHeaderValue(import.meta.env.VITE_SUPABASE_URL)
  if (!url) return null
  if (!SUPABASE_ANON_KEY) {
    console.warn('[api] VITE_SUPABASE_URL is set but VITE_SUPABASE_ANON_KEY is missing/invalid — proxy disabled')
    return null
  }
  return `${url}/functions/v1/donki-proxy`
})()

// ─── Date Helpers ────────────────────────────────────────────────────────────

/**
 * Format a Date object to the YYYY-MM-DD string required by NASA DONKI API.
 * @param {Date} date
 * @returns {string}
 */
function toApiDate(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Returns a default date range of the last 30 days.
 * @returns {{ startDate: string, endDate: string }}
 */
export function getDefaultDateRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    startDate: toApiDate(start),
    endDate: toApiDate(end),
  }
}

// ─── Generic Direct-fetch Helper ─────────────────────────────────────────────

async function donkiGet(endpoint, params = {}) {
  const searchParams = new URLSearchParams({ ...params, api_key: NASA_API_KEY })
  const url = `${NASA_BASE_URL}/${endpoint}?${searchParams}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `NASA DONKI ${endpoint}: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`
    )
  }
  return res.json()
}

// ─── Individual Endpoint Fetchers (direct) ───────────────────────────────────

/**
 * Fetch Coronal Mass Ejections (CME).
 * @param {{ startDate: string, endDate: string }} dateRange
 */
export async function fetchCME(dateRange = getDefaultDateRange()) {
  return donkiGet('CME', { startDate: dateRange.startDate, endDate: dateRange.endDate })
}

/**
 * Fetch CME Analysis data.
 * mostAccurateOnly=true returns only the best available analysis per event.
 * @param {{ startDate: string, endDate: string }} dateRange
 */
export async function fetchCMEAnalysis(dateRange = getDefaultDateRange()) {
  return donkiGet('CMEAnalysis', {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    mostAccurateOnly: 'true',
  })
}

/**
 * Fetch Geomagnetic Storms (GST).
 * @param {{ startDate: string, endDate: string }} dateRange
 */
export async function fetchGST(dateRange = getDefaultDateRange()) {
  return donkiGet('GST', { startDate: dateRange.startDate, endDate: dateRange.endDate })
}

/**
 * Fetch Solar Flares (FLR).
 * @param {{ startDate: string, endDate: string }} dateRange
 */
export async function fetchFLR(dateRange = getDefaultDateRange()) {
  return donkiGet('FLR', { startDate: dateRange.startDate, endDate: dateRange.endDate })
}

// ─── Aggregate Fetcher ───────────────────────────────────────────────────────

/**
 * Fetch all 4 space weather datasets.
 *
 * If VITE_SUPABASE_URL is set, this calls the `donki-proxy` Edge Function which:
 *   - adds the NASA key server-side (key never reaches the browser)
 *   - returns all 4 datasets in a single HTTP request
 *   - serves from a 15-minute Postgres cache when available
 *
 * Falls back to direct NASA API calls if:
 *   - Supabase is not configured (VITE_SUPABASE_URL not set)
 *   - The anon key is missing/malformed
 *   - The proxy request fails (network error, function not deployed, etc.)
 *
 * @param {{ startDate: string, endDate: string }} dateRange
 * @returns {{ cme: Array, cmeAnalysis: Array, gst: Array, flr: Array }}
 */
export async function fetchAllSpaceWeather(dateRange = getDefaultDateRange()) {
  // ── Proxy path ──
  if (PROXY_BASE_URL) {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate:   dateRange.endDate,
      })
      const res = await fetch(`${PROXY_BASE_URL}?${params}`, {
        headers: {
          // The anon key is needed to invoke Edge Functions.
          // It is already public (included in the Supabase JS client bundle),
          // so bundling it here adds no additional exposure.
          apikey:        SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        return {
          cme:         data.cme         ?? [],
          cmeAnalysis: data.cmeAnalysis ?? [],
          gst:         data.gst         ?? [],
          flr:         data.flr         ?? [],
        }
      }

      console.warn(`[api] Proxy returned ${res.status} — falling back to direct NASA calls`)
    } catch (proxyErr) {
      console.warn('[api] Proxy request failed — falling back to direct NASA calls:', proxyErr)
    }
  }

  // ── Direct fallback path ──
  const [cme, cmeAnalysis, gst, flr] = await Promise.allSettled([
    fetchCME(dateRange),
    fetchCMEAnalysis(dateRange),
    fetchGST(dateRange),
    fetchFLR(dateRange),
  ])

  return {
    cme:         cme.status         === 'fulfilled' ? (cme.value         ?? []) : [],
    cmeAnalysis: cmeAnalysis.status === 'fulfilled' ? (cmeAnalysis.value ?? []) : [],
    gst:         gst.status         === 'fulfilled' ? (gst.value         ?? []) : [],
    flr:         flr.status         === 'fulfilled' ? (flr.value         ?? []) : [],
  }
}