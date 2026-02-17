import { Router, type Router as RouterType } from 'express'
import { requireAuth } from '../middleware/auth.js'
import type { SimulatorEngine } from '../simulator/engine.js'
import { getAllScenarios } from '../simulator/scenarios.js'
import type { ScenarioId } from '@openpulse/shared'

const router: RouterType = Router()

// Module-level engine reference. Set by setEngine() during server initialization.
// The simulator engine is wired in Plan 03-03; until then, endpoints return 503.
let engine: SimulatorEngine | null = null

/**
 * Set the simulator engine reference.
 * Called during server initialization after the engine is created.
 */
export function setEngine(e: SimulatorEngine): void {
  engine = e
}

// All endpoints require authentication but no role restriction
// (per locked decision: dev panel accessible to any authenticated user, both roles)

/**
 * GET /api/simulator/status
 * Returns the full simulator status including all patient states.
 */
router.get('/status', requireAuth, (_req, res) => {
  if (!engine) {
    res.status(503).json({ error: 'Simulator not initialized' })
    return
  }
  res.json(engine.getStatus())
})

/**
 * POST /api/simulator/pause
 * Pauses the simulation tick loop while preserving state.
 */
router.post('/pause', requireAuth, (_req, res) => {
  if (!engine) {
    res.status(503).json({ error: 'Simulator not initialized' })
    return
  }
  engine.pause()
  res.json({ success: true })
})

/**
 * POST /api/simulator/resume
 * Resumes the simulation tick loop after a pause.
 */
router.post('/resume', requireAuth, (_req, res) => {
  if (!engine) {
    res.status(503).json({ error: 'Simulator not initialized' })
    return
  }
  engine.resume()
  res.json({ success: true })
})

/**
 * POST /api/simulator/speed
 * Sets the simulation time speed multiplier.
 * Body: { speed: number } -- must be between 1 and 100.
 */
router.post('/speed', requireAuth, (req, res) => {
  if (!engine) {
    res.status(503).json({ error: 'Simulator not initialized' })
    return
  }

  const { speed } = req.body
  if (typeof speed !== 'number' || speed < 1 || speed > 100) {
    res.status(400).json({ error: 'Speed must be a number between 1 and 100' })
    return
  }

  engine.clock.setSpeed(speed)
  res.json({ success: true, speed })
})

/**
 * POST /api/simulator/scenario
 * Applies a preset clinical scenario to a specific patient.
 * Body: { patientId: number, scenarioId: string }
 */
router.post('/scenario', requireAuth, (req, res) => {
  if (!engine) {
    res.status(503).json({ error: 'Simulator not initialized' })
    return
  }

  const { patientId, scenarioId } = req.body
  if (typeof patientId !== 'number' || typeof scenarioId !== 'string') {
    res.status(400).json({ error: 'patientId (number) and scenarioId (string) are required' })
    return
  }

  engine.applyScenario(patientId, scenarioId as ScenarioId)
  res.json({ success: true })
})

/**
 * POST /api/simulator/reset/:patientId
 * Resets a specific patient to their baseline values.
 */
router.post('/reset/:patientId', requireAuth, (req, res) => {
  if (!engine) {
    res.status(503).json({ error: 'Simulator not initialized' })
    return
  }

  const rawId = req.params.patientId
  const patientId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10)
  if (isNaN(patientId)) {
    res.status(400).json({ error: 'Invalid patient ID' })
    return
  }

  engine.resetPatient(patientId)
  res.json({ success: true })
})

/**
 * POST /api/simulator/reset-all
 * Resets all patients to their baseline values.
 */
router.post('/reset-all', requireAuth, (_req, res) => {
  if (!engine) {
    res.status(503).json({ error: 'Simulator not initialized' })
    return
  }

  engine.resetAll()
  res.json({ success: true })
})

/**
 * GET /api/simulator/scenarios
 * Returns the list of all available preset clinical scenarios.
 */
router.get('/scenarios', requireAuth, (_req, res) => {
  res.json(getAllScenarios())
})

export { router as simulatorRouter }
