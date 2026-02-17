import { Router, type Router as RouterType } from 'express'
import { eq, and, gte, desc, asc } from 'drizzle-orm'
import { requireAuth } from '../middleware/auth.js'
import { getDb } from '../db/connection.js'
import { vitalReadings } from '../db/schema.js'

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

export { router as vitalsRouter }
