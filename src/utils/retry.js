/**
 * withRetry — wraps an async function with exponential-backoff retry logic.
 *
 * Retries up to `maxAttempts` times on failure, with delays of:
 *   attempt 1 → baseDelayMs * 2^0 + jitter
 *   attempt 2 → baseDelayMs * 2^1 + jitter
 *   attempt 3 → baseDelayMs * 2^2 + jitter
 *   ...
 *
 * Jitter (0–200 ms) is added to spread retries and avoid thundering-herd
 * issues when multiple events fail and retry simultaneously.
 *
 * @param {() => Promise<{ data: any, error: any }>} fn
 *   Async function that resolves to a `{ data, error }` object (Supabase style).
 *   A result where `error` is truthy is treated as a failure.
 * @param {number} [maxAttempts=3]
 * @param {number} [baseDelayMs=1000]
 * @returns {Promise<{ data: any, error: any }>}
 *   Resolves with the last result, whether or not all attempts failed.
 */
export async function withRetry(fn, maxAttempts = 3, baseDelayMs = 1000) {
  let lastResult = { data: null, error: new Error('No attempts made') }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fn()

      // Supabase-style: { data, error } — treat truthy error as failure
      if (!result?.error) return result

      lastResult = result

      // Don't wait after the last attempt
      if (attempt < maxAttempts - 1) {
        const jitter = Math.random() * 200
        const delay  = baseDelayMs * Math.pow(2, attempt) + jitter
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (err) {
      lastResult = { data: null, error: err }

      if (attempt < maxAttempts - 1) {
        const jitter = Math.random() * 200
        const delay  = baseDelayMs * Math.pow(2, attempt) + jitter
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  return lastResult
}
