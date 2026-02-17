import type { VitalReadingPayload } from '@openpulse/shared'
import { getDb } from '../db/connection.js'
import { vitalReadings } from '../db/schema.js'

/**
 * Persist a single vital reading to the SQLite database.
 *
 * better-sqlite3 is synchronous, so this is a simple blocking call.
 * At 6 patients x 1 write per 5s = 1.2 writes/sec, this is negligible.
 *
 * HR, systolic, diastolic are integers in schema -- round them.
 * SpO2 and temperature are real (float) -- keep decimal precision
 * (round temperature to 1 decimal).
 */
export function persistReading(reading: VitalReadingPayload): void {
  const db = getDb()
  db.insert(vitalReadings).values({
    patientId: reading.patientId,
    heartRate: reading.heartRate !== null ? Math.round(reading.heartRate) : null,
    bpSystolic: reading.bpSystolic !== null ? Math.round(reading.bpSystolic) : null,
    bpDiastolic: reading.bpDiastolic !== null ? Math.round(reading.bpDiastolic) : null,
    spo2: reading.spo2,
    temperature: reading.temperature !== null ? Math.round(reading.temperature * 10) / 10 : null,
    isAnomaly: reading.isAnomaly,
    recordedAt: reading.recordedAt,
  }).run()
}
