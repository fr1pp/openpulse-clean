import { Router, type Router as RouterType } from 'express'
import { eq, and, gte, lte, desc, asc, avg, min, max, sql } from 'drizzle-orm'
import { requireAuth } from '../middleware/auth.js'
import { getDb } from '../db/connection.js'
import { vitalReadings } from '../db/schema.js'
import type { HistoricalReading, AggregationBucket } from '@openpulse/shared'

const router: RouterType = Router()

/**
 * GET /api/vitals/:patientId/recent
 *
 * Returns recent vital readings for a patient.
 * Used for initial chart population and reconnection backfill.
 *
 * Query params:
 *   since  - ISO 8601 timestamp (default: 30 minutes ago)
 *   limit  - Max readings to return (default: 360 = 30 min at 5s intervals)
 *
 * Role enforcement: patients can only access their own data.
 */
router.get('/:patientId/recent', requireAuth, (req, res) => {
  const rawId = req.params.patientId
  const patientId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10)
  if (isNaN(patientId)) {
    res.status(400).json({ error: 'Invalid patient ID' })
    return
  }

  // Patients can only see their own data
  if (req.user!.role === 'patient' && req.user!.sub !== patientId) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const since = (req.query.since as string) ||
    new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const limit = Math.min(parseInt((req.query.limit as string) || '360', 10), 1000)

  const db = getDb()
  const readings = db
    .select()
    .from(vitalReadings)
    .where(
      and(
        eq(vitalReadings.patientId, patientId),
        gte(vitalReadings.recordedAt, since),
      ),
    )
    .orderBy(asc(vitalReadings.recordedAt))
    .limit(limit)
    .all()

  res.json(readings)
})

/**
 * GET /api/vitals/:patientId/latest
 *
 * Returns the single most recent vital reading for a patient.
 * Used for dashboard cards and quick status checks.
 *
 * Role enforcement: patients can only access their own data.
 */
router.get('/:patientId/latest', requireAuth, (req, res) => {
  const rawId = req.params.patientId
  const patientId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10)
  if (isNaN(patientId)) {
    res.status(400).json({ error: 'Invalid patient ID' })
    return
  }

  // Patients can only see their own data
  if (req.user!.role === 'patient' && req.user!.sub !== patientId) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const db = getDb()
  const reading = db
    .select()
    .from(vitalReadings)
    .where(eq(vitalReadings.patientId, patientId))
    .orderBy(desc(vitalReadings.recordedAt))
    .limit(1)
    .get()

  res.json(reading ?? null)
})

/**
 * GET /api/vitals/:patientId/history
 *
 * Returns historical vital readings for a patient.
 * Supports both raw (1h, 6h) and aggregated (24h, 7d, 30d) modes.
 *
 * Query params:
 *   since     - ISO 8601 timestamp (required)
 *   until     - ISO 8601 timestamp (optional, defaults to now)
 *   aggregate - 'true' to enable bucketed aggregation
 *   bucket    - '1m' | '5m' | '30m' | '2h' (required when aggregate=true)
 *
 * Role enforcement: patients can only access their own data.
 */
router.get('/:patientId/history', requireAuth, (req, res) => {
  const rawId = req.params.patientId
  const patientId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10)
  if (isNaN(patientId)) {
    res.status(400).json({ error: 'Invalid patient ID' })
    return
  }

  // Patients can only see their own data
  if (req.user!.role === 'patient' && req.user!.sub !== patientId) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const since = req.query.since as string | undefined
  if (!since) {
    res.status(400).json({ error: 'Missing required query parameter: since' })
    return
  }

  const until = (req.query.until as string) || new Date().toISOString()
  const aggregate = req.query.aggregate === 'true'
  const bucket = req.query.bucket as AggregationBucket | undefined

  if (aggregate && bucket && !['1m', '5m', '30m', '2h'].includes(bucket)) {
    res.status(400).json({ error: 'Invalid bucket value. Must be one of: 1m, 5m, 30m, 2h' })
    return
  }

  const db = getDb()

  if (!aggregate) {
    // Raw mode: return all readings within the time window
    const readings = db
      .select()
      .from(vitalReadings)
      .where(
        and(
          eq(vitalReadings.patientId, patientId),
          gte(vitalReadings.recordedAt, since),
          lte(vitalReadings.recordedAt, until),
        ),
      )
      .orderBy(asc(vitalReadings.recordedAt))
      .limit(5000)
      .all()

    const result: HistoricalReading[] = readings.map((r) => ({
      recordedAt: r.recordedAt,
      heartRate: r.heartRate,
      bpSystolic: r.bpSystolic,
      bpDiastolic: r.bpDiastolic,
      spo2: r.spo2,
      temperature: r.temperature,
    }))

    res.json(result)
    return
  }

  // Aggregated mode: bucket and compute avg/min/max per bucket
  if (!bucket) {
    res.status(400).json({ error: 'bucket param is required when aggregate=true' })
    return
  }

  // Build bucket expression based on bucket size
  let bucketExpr: ReturnType<typeof sql<string>>
  switch (bucket) {
    case '1m':
      bucketExpr = sql<string>`strftime('%Y-%m-%dT%H:%M:00', recorded_at)`
      break
    case '5m':
      bucketExpr = sql<string>`strftime('%Y-%m-%dT%H:', recorded_at) || printf('%02d', (CAST(strftime('%M', recorded_at) AS INTEGER) / 5) * 5) || ':00'`
      break
    case '30m':
      bucketExpr = sql<string>`strftime('%Y-%m-%dT%H:', recorded_at) || printf('%02d', (CAST(strftime('%M', recorded_at) AS INTEGER) / 30) * 30) || ':00'`
      break
    case '2h':
      bucketExpr = sql<string>`strftime('%Y-%m-%dT', recorded_at) || printf('%02d', (CAST(strftime('%H', recorded_at) AS INTEGER) / 2) * 2) || ':00:00'`
      break
  }

  const readings = db
    .select({
      recordedAt: bucketExpr,
      heartRate: avg(vitalReadings.heartRate).mapWith(Number),
      heartRateMin: min(vitalReadings.heartRate).mapWith(Number),
      heartRateMax: max(vitalReadings.heartRate).mapWith(Number),
      bpSystolic: avg(vitalReadings.bpSystolic).mapWith(Number),
      bpSystolicMin: min(vitalReadings.bpSystolic).mapWith(Number),
      bpSystolicMax: max(vitalReadings.bpSystolic).mapWith(Number),
      bpDiastolic: avg(vitalReadings.bpDiastolic).mapWith(Number),
      bpDiastolicMin: min(vitalReadings.bpDiastolic).mapWith(Number),
      bpDiastolicMax: max(vitalReadings.bpDiastolic).mapWith(Number),
      spo2: avg(vitalReadings.spo2).mapWith(Number),
      spo2Min: min(vitalReadings.spo2).mapWith(Number),
      spo2Max: max(vitalReadings.spo2).mapWith(Number),
      temperature: avg(vitalReadings.temperature).mapWith(Number),
      temperatureMin: min(vitalReadings.temperature).mapWith(Number),
      temperatureMax: max(vitalReadings.temperature).mapWith(Number),
    })
    .from(vitalReadings)
    .where(
      and(
        eq(vitalReadings.patientId, patientId),
        gte(vitalReadings.recordedAt, since),
        lte(vitalReadings.recordedAt, until),
      ),
    )
    .groupBy(bucketExpr)
    .orderBy(bucketExpr)
    .all()

  res.json(readings as HistoricalReading[])
})

export { router as vitalsRouter }
