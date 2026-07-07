/**
 * Supabase Client
 *
 * Reads credentials from environment variables:
 *   VITE_SUPABASE_URL      — e.g. https://abcdefgh.supabase.co
 *   VITE_SUPABASE_ANON_KEY — the public anon key (safe to expose in browser)
 *
 * If either variable is missing, the client is set to null and
 * isSupabaseConfigured() returns false. The app continues to work
 * without Supabase — only the History page will show a setup prompt.
 */
import { createClient } from '@supabase/supabase-js'

/**
 * Sanitize an env var value: trims whitespace/invisible chars and strips
 * anything outside the ISO-8859-1 range (smart quotes, zero-width spaces,
 * etc. sometimes get pasted into .env files and silently break fetch headers,
 * throwing "String contains non ISO-8859-1 code point").
 *
 * The Supabase JS client sends this value as the `apikey` / `Authorization`
 * headers on every request it makes internally, so it must be sanitized
 * here too — not just in services/api.js.
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

const supabaseUrl = sanitizeHeaderValue(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = sanitizeHeaderValue(import.meta.env.VITE_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing environment variables.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.\n' +
    'History page and data persistence will be disabled until configured.'
  )
}

/**
 * The Supabase client instance.
 * Will be null if environment variables are not set.
 * @type {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

/**
 * Returns true if Supabase is properly configured and ready to use.
 * Check this before calling any Supabase methods.
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  return supabase !== null
}