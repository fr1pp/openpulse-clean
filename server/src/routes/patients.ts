import { Router, type Router as RouterType } from 'express'
import { eq } from 'drizzle-orm'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { getDb } from '../db/connection.js'
import { patients } from '../db/schema.js'

const router: RouterType = Router()

/**
 * GET /api/patients
 *
 * Returns all active patients with demographics.
 * Used by the healthcare pro dashboard card grid.
 *
 * Role enforcement: healthcare_pro only.
 */
router.get('/', requireAuth, requireRole('healthcare_pro'), (_req, res) => {
  const db = getDb()
  const result = db
    .select({
      id: patients.id,
      firstName: patients.firstName,
      lastName: patients.lastName,
      dateOfBirth: patients.dateOfBirth,
      gender: patients.gender,
      primaryCondition: patients.primaryCondition,
    })
    .from(patients)
    .where(eq(patients.isActive, true))
    .all()

  res.json(result)
})

export { router as patientsRouter }
