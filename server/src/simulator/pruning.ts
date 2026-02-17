import { getDb } from '../db/connection.js'
import { vitalReadings } from '../db/schema.js'
import { lt } from 'drizzle-orm'

/**
 * Delete vital readings older than the specified retention period.
 *
 * @param retentionDays - Number of days to retain readings (default: 30)
 * @returns Number of deleted rows
 */
export function pruneOldReadings(retentionDays = 30): number {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString()
  const db = getDb()
  const result = db.delete(vitalReadings).where(lt(vitalReadings.recordedAt, cutoff)).run()
  const deleted = result.changes
  if (deleted > 0) {
    console.log(`[Pruning] Pruned ${deleted} readings older than ${retentionDays} days`)
  }
  return deleted
}

/**
 * Start a recurring pruning schedule.
 * Runs pruneOldReadings() immediately on call, then every `intervalHours` hours.
 *
 * @param intervalHours - Hours between pruning runs (default: 6)
 * @returns The interval ID for cleanup
 */
export function startPruningSchedule(intervalHours = 6): ReturnType<typeof setInterval> {
  // Run immediately on startup
  pruneOldReadings()

  // Schedule recurring pruning
  const intervalMs = intervalHours * 60 * 60 * 1000
  return setInterval(() => pruneOldReadings(), intervalMs)
}
