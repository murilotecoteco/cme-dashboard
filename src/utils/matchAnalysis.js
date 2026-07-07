/**
 * matchAnalysis — find the best CMEAnalysis record for a given CME event.
 *
 * Strategy:
 *   1. Primary:  exact match on `associatedCMEID === cme.activityID`
 *   2. Fallback: closest `time21_5` timestamp within MAX_WINDOW_MS of
 *                the CME's `startTime`, if no exact ID match exists.
 *
 * The fallback handles cases where NASA's CMEAnalysis records lack an
 * `associatedCMEID` or where the ID format differs slightly from the CME
 * activity ID, while still keeping a tight time window to avoid false matches.
 *
 * @param {Array<Object>} analysisList  — full CMEAnalysis array from NASA DONKI
 * @param {string}        activityID    — CME activityID to match against
 * @param {string}        startTime     — CME startTime ISO string
 * @returns {Object | undefined}
 */

/** Maximum time difference (ms) for fallback time-proximity matching: 24 hours */
const MAX_WINDOW_MS = 24 * 60 * 60 * 1000

export function matchAnalysis(analysisList, activityID, startTime) {
  if (!Array.isArray(analysisList) || !analysisList.length) return undefined

  // 1. Exact ID match (fast path — covers most cases)
  const exact = analysisList.find((a) => a.associatedCMEID === activityID)
  if (exact) return exact

  // 2. Time-proximity fallback
  if (!startTime) return undefined

  const cmeTime = new Date(startTime).getTime()
  if (isNaN(cmeTime)) return undefined

  // Filter to those within the window and that have a parseable timestamp
  const candidates = analysisList
    .map((a) => {
      const analysisTime = a.time21_5
        ? new Date(a.time21_5).getTime()
        : NaN
      return { analysis: a, diff: Math.abs(analysisTime - cmeTime) }
    })
    .filter(({ diff }) => !isNaN(diff) && diff <= MAX_WINDOW_MS)

  if (!candidates.length) return undefined

  // Pick the closest one
  candidates.sort((a, b) => a.diff - b.diff)
  return candidates[0].analysis
}
