/**
 * donki-proxy — Supabase Edge Function
 *
 * Acts as a secure server-side proxy for the NASA DONKI API.
 *
 * Why this exists:
 *   - Keeps the NASA API key out of the browser bundle (stored as a
 *     Supabase secret, never sent to clients)
 *   - Caches responses in Postgres for 15 minutes to avoid hitting
 *     NASA's rate limits (30 req/hour for DEMO_KEY, 1000/hour for
 *     personal keys) when multiple users fetch the same date range
 *   - Adds CORS headers so the browser can call it from any origin
 *
 * Request (GET):
 *   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * Response (200 JSON):
 *   { cme: [...], cmeAnalysis: [...], gst: [...], flr: [...] }
 *
 * Error responses:
 *   400 — missing/invalid date parameters
 *   502 — NASA API upstream error
 *   500 — unexpected server error
 *
 * Environment secrets required (set via `supabase secrets set`):
 *   NASA_API_KEY — your personal NASA API key
 *
 * Cache table required (see supabase/migrations/ for DDL):
 *   donki_cache (cache_key text PK, payload jsonb, fetched_at timestamptz)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Config ──────────────────────────────────────────────────────────────────

const NASA_BASE = 'https://api.nasa.gov/DONKI'
const CACHE_TTL_MS = 15 * 60 * 1000   // 15 minutes

// ─── CORS headers (allow all origins for a public demo app) ──────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function error(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

/** Fetch one DONKI endpoint; returns [] on non-200 to avoid blocking siblings */
async function donkiGet(endpoint: string, params: Record<string, string>): Promise<unknown[]> {
  const apiKey = Deno.env.get('NASA_API_KEY') ?? 'DEMO_KEY'
  const qs = new URLSearchParams({ ...params, api_key: apiKey })
  const res = await fetch(`${NASA_BASE}/${endpoint}?${qs}`)
  if (!res.ok) {
    console.warn(`[donki-proxy] NASA ${endpoint} returned ${res.status}`)
    return []
  }
  return (await res.json()) ?? []
}

/** YYYY-MM-DD validation */
function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s))
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Handle CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'GET') {
    return error('Method not allowed', 405)
  }

  // ── Parse + validate query params ──
  const url = new URL(req.url)
  const startDate = url.searchParams.get('startDate') ?? ''
  const endDate   = url.searchParams.get('endDate')   ?? ''

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return error('startDate and endDate are required (YYYY-MM-DD)', 400)
  }

  if (new Date(startDate) > new Date(endDate)) {
    return error('startDate must be before or equal to endDate', 400)
  }

  const cacheKey = `${startDate}__${endDate}`

  // ── Try Postgres cache ──
  // Use service-role key so the function can read/write the cache table
  // even if RLS is enabled on other tables.
  const supabaseUrl     = Deno.env.get('SUPABASE_URL')!
  const supabaseKey     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase        = createClient(supabaseUrl, supabaseKey)

  const { data: cached } = await supabase
    .from('donki_cache')
    .select('payload, fetched_at')
    .eq('cache_key', cacheKey)
    .maybeSingle()

  if (cached) {
    const age = Date.now() - new Date(cached.fetched_at).getTime()
    if (age < CACHE_TTL_MS) {
      console.log(`[donki-proxy] Cache HIT for ${cacheKey} (age ${Math.round(age / 1000)}s)`)
      return json({ ...cached.payload, _cached: true })
    }
    console.log(`[donki-proxy] Cache STALE for ${cacheKey}`)
  }

  // ── Fetch from NASA in parallel ──
  console.log(`[donki-proxy] Fetching NASA DONKI for ${cacheKey}`)
  const dateParams = { startDate, endDate }

  const [cme, cmeAnalysis, gst, flr] = await Promise.allSettled([
    donkiGet('CME',         dateParams),
    donkiGet('CMEAnalysis', { ...dateParams, mostAccurateOnly: 'true' }),
    donkiGet('GST',         dateParams),
    donkiGet('FLR',         dateParams),
  ])

  const payload = {
    cme:         cme.status         === 'fulfilled' ? cme.value         : [],
    cmeAnalysis: cmeAnalysis.status === 'fulfilled' ? cmeAnalysis.value : [],
    gst:         gst.status         === 'fulfilled' ? gst.value         : [],
    flr:         flr.status         === 'fulfilled' ? flr.value         : [],
  }

  // ── Store in cache (upsert) — fire-and-forget, never blocks the response ──
  supabase
    .from('donki_cache')
    .upsert({ cache_key: cacheKey, payload, fetched_at: new Date().toISOString() })
    .then(({ error: e }) => {
      if (e) console.warn('[donki-proxy] Cache write failed:', e.message)
    })

  return json(payload)
})
