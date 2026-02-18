import { Router, type Router as RouterType } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { config } from '../lib/config.js'
import { getDb } from '../db/connection.js'
import { healthcarePros, patients } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'

const router: RouterType = Router()

// Healthcare pro login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const db = getDb()
  const user = db.select().from(healthcarePros)
    .where(eq(healthcarePros.email, email))
    .get()

  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const token = jwt.sign(
    { sub: user.id, role: 'healthcare_pro', email: user.email, adminRole: user.role },
    config.jwtSecret,
    { expiresIn: '24h' }
  )

  res.cookie('token', token, config.cookieOptions)
  res.json({
    id: user.id,
    role: 'healthcare_pro' as const,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    adminRole: user.role,
  })
})

// Patient login (access code)
router.post('/patient-login', async (req, res) => {
  const { code } = req.body
  if (!code) {
    res.status(400).json({ error: 'Access code is required' })
    return
  }

  const db = getDb()
  const patient = db.select().from(patients)
    .where(eq(patients.accessCode, code.toUpperCase()))
    .get()

  if (!patient || !patient.isActive) {
    res.status(401).json({ error: 'Invalid access code' })
    return
  }

  const token = jwt.sign(
    { sub: patient.id, role: 'patient', accessCode: patient.accessCode },
    config.jwtSecret,
    { expiresIn: '8h' }
  )

  res.cookie('token', token, config.cookieOptions)
  res.json({
    id: patient.id,
    role: 'patient' as const,
    firstName: patient.firstName,
    lastName: patient.lastName,
    accessCode: patient.accessCode,
  })
})

// Get current user
router.get('/me', requireAuth, (req, res) => {
  const db = getDb()

  if (req.user!.role === 'healthcare_pro') {
    const user = db.select().from(healthcarePros)
      .where(eq(healthcarePros.id, req.user!.sub))
      .get()

    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    res.json({
      id: user.id,
      role: 'healthcare_pro' as const,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      adminRole: user.role,
    })
  } else {
    const patient = db.select().from(patients)
      .where(eq(patients.id, req.user!.sub))
      .get()

    if (!patient) {
      res.status(401).json({ error: 'Patient not found' })
      return
    }

    res.json({
      id: patient.id,
      role: 'patient' as const,
      firstName: patient.firstName,
      lastName: patient.lastName,
      accessCode: patient.accessCode,
    })
  }
})

// Logout
router.post('/logout', (_req, res) => {
  const { maxAge: _, ...clearOptions } = config.cookieOptions
  res.clearCookie('token', clearOptions)
  res.json({ success: true })
})

export { router as authRouter }
