import { Router, type Router as RouterType } from 'express'
import { eq, and } from 'drizzle-orm'
import { requireAuth, requireRole, requireAdminRole } from '../middleware/auth.js'
import { getDb } from '../db/connection.js'
import { patients } from '../db/schema.js'
import { generateAccessCode } from '../lib/access-code.js'

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

/**
 * GET /api/patients/:id
 *
 * Returns full patient data including accessCode and qrCodeData.
 * Role enforcement: any healthcare_pro.
 */
router.get('/:id', requireAuth, requireRole('healthcare_pro'), (req, res) => {
  const db = getDb()
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id)

  const patient = db
    .select()
    .from(patients)
    .where(and(eq(patients.id, id), eq(patients.isActive, true)))
    .get()

  if (!patient) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  res.json(patient)
})

/**
 * POST /api/patients
 *
 * Creates a new patient with auto-generated 4-char access code.
 * Role enforcement: admin only.
 */
router.post('/', requireAuth, requireRole('healthcare_pro'), requireAdminRole, (req, res) => {
  const { firstName, lastName, dateOfBirth, gender } = req.body

  if (!firstName || !lastName || !dateOfBirth || !gender) {
    res.status(400).json({ error: 'firstName, lastName, dateOfBirth, and gender are required' })
    return
  }

  const db = getDb()
  const accessCode = generateAccessCode()
  const qrCodeData = `/portal/login?code=${accessCode}`

  const newPatient = db
    .insert(patients)
    .values({ firstName, lastName, dateOfBirth, gender, accessCode, qrCodeData })
    .returning()
    .get()

  res.status(201).json(newPatient)
})

/**
 * PATCH /api/patients/:id
 *
 * Updates patient demographics (firstName, lastName, dateOfBirth, gender).
 * Role enforcement: any healthcare_pro.
 */
router.patch('/:id', requireAuth, requireRole('healthcare_pro'), (req, res) => {
  const db = getDb()
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id)

  const { firstName, lastName, dateOfBirth, gender } = req.body
  const updates: Record<string, unknown> = {}

  if (firstName !== undefined) updates.firstName = firstName
  if (lastName !== undefined) updates.lastName = lastName
  if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth
  if (gender !== undefined) updates.gender = gender

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No fields to update' })
    return
  }

  updates.updatedAt = new Date().toISOString()

  const updated = db
    .update(patients)
    .set(updates)
    .where(and(eq(patients.id, id), eq(patients.isActive, true)))
    .returning()
    .get()

  if (!updated) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  res.json(updated)
})

/**
 * DELETE /api/patients/:id
 *
 * Soft-deletes a patient by setting isActive=false.
 * Role enforcement: admin only.
 */
router.delete('/:id', requireAuth, requireRole('healthcare_pro'), requireAdminRole, (req, res) => {
  const db = getDb()
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id)

  const deleted = db
    .update(patients)
    .set({ isActive: false, updatedAt: new Date().toISOString() })
    .where(and(eq(patients.id, id), eq(patients.isActive, true)))
    .returning()
    .get()

  if (!deleted) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  res.json({ success: true })
})

/**
 * PATCH /api/patients/:id/access-code
 *
 * Regenerates a unique access code for the patient.
 * Role enforcement: admin only.
 */
router.patch('/:id/access-code', requireAuth, requireRole('healthcare_pro'), requireAdminRole, (req, res) => {
  const db = getDb()
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id)

  // Verify patient exists and is active
  const existing = db
    .select({ id: patients.id })
    .from(patients)
    .where(and(eq(patients.id, id), eq(patients.isActive, true)))
    .get()

  if (!existing) {
    res.status(404).json({ error: 'Patient not found' })
    return
  }

  const newCode = generateAccessCode()
  const newQrCodeData = `/portal/login?code=${newCode}`

  db.update(patients)
    .set({ accessCode: newCode, qrCodeData: newQrCodeData, updatedAt: new Date().toISOString() })
    .where(eq(patients.id, id))
    .returning()
    .get()

  res.json({ id, accessCode: newCode, qrCodeData: newQrCodeData })
})

export { router as patientsRouter }
