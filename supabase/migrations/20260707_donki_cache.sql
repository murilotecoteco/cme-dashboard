-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: cache table for donki-proxy Edge Function
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Cache table for DONKI API responses.
-- The donki-proxy Edge Function reads from and writes to this table.
-- Rows are keyed by "startDate__endDate" and expire after 15 minutes
-- (TTL is enforced in application logic; the pg_cron job below cleans stale rows).
CREATE TABLE IF NOT EXISTS public.donki_cache (
  cache_key  text PRIMARY KEY,
  payload    jsonb        NOT NULL,
  fetched_at timestamptz  NOT NULL DEFAULT now()
);

-- Optional: auto-clean rows older than 1 hour with pg_cron.
-- Enable pg_cron via: Dashboard → Database → Extensions → pg_cron
-- SELECT cron.schedule(
--   'clean-donki-cache',          -- job name
--   '0 * * * *',                  -- every hour
--   $$DELETE FROM public.donki_cache WHERE fetched_at < now() - interval '1 hour'$$
-- );
