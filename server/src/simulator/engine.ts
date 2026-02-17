// SimulatorEngine: orchestrates vital sign generation for all patients.
// PURE module -- no database, no Socket.io, no Express imports.
// Output is delivered via onReading and onEvent callbacks (wired in Plan 03).

import type { VitalReadingPayload, SimulatorEventPayload } from '@openpulse/shared'
import type { SimulatorStatus, ScenarioId, PatientBaseline } from '@openpulse/shared'
import { ouStep, clampVital } from './generators.js'
import type { OUParams } from './generators.js'
import { applyCorrelations } from './correlations.js'
import { getBaselines, getDefaultBaseline } from './baselines.js'
import { SCENARIOS } from './scenarios.js'
import { PatientState } from './patient-state.js'
import { SimulatedClock } from './clock.js'

// Default OU parameters per vital type.
// sigma is derived at tick-time from the patient's baseline stdDev:
//   sigma = volatilityFraction * baselineStdDev * sqrt(2 * theta)
// This guarantees the OU steady-state stdDev = volatilityFraction * baselineStdDev,
// keeping noise proportional to each patient's clinical range regardless of their profile.
const DEFAULT_OU_PARAMS: Record<string, { theta: number; volatilityFraction: number }> = {
  heartRate:   { theta: 0.15, volatilityFraction: 0.6 },
  bpSystolic:  { theta: 0.12, volatilityFraction: 0.6 },
  bpDiastolic: { theta: 0.12, volatilityFraction: 0.6 },
  spo2:        { theta: 0.20, volatilityFraction: 0.6 },
  temperature: { theta: 0.10, volatilityFraction: 0.6 },
}

const VITAL_TYPES = ['heartRate', 'bpSystolic', 'bpDiastolic', 'spo2', 'temperature'] as const

// Maps vital type names to PatientBaseline field names
const BASELINE_KEY_MAP: Record<string, keyof PatientBaseline> = {
  heartRate:   'heartRate',
  bpSystolic:  'systolic',
  bpDiastolic: 'diastolic',
  spo2:        'spo2',
  temperature: 'temperature',
}

export class SimulatorEngine {
  clock: SimulatedClock
  private patients: Map<number, PatientState> = new Map()
  private intervalId: ReturnType<typeof setInterval> | null = null
  private running: boolean = false
  private tickIntervalMs: number = 5000
  private onReading: (reading: VitalReadingPayload) => void
  private onEvent: (event: SimulatorEventPayload) => void

  constructor(
    onReading: (reading: VitalReadingPayload) => void,
    onEvent: (event: SimulatorEventPayload) => void,
    options?: { tickIntervalMs?: number; speedMultiplier?: number }
  ) {
    this.onReading = onReading
    this.onEvent = onEvent
    this.tickIntervalMs = options?.tickIntervalMs ?? 5000
    this.clock = new SimulatedClock(options?.speedMultiplier ?? 1)
  }

  /**
   * Start the simulation engine.
   * Loads baselines, creates patient states, and begins the tick loop.
   */
  start(): void {
    if (this.running) return

    this.running = true
    this.intervalId = setInterval(() => this.tick(), this.tickIntervalMs)
    console.log(`[Simulator] Started with ${this.patients.size} patients, tick interval ${this.tickIntervalMs}ms`)
  }

  /**
   * Stop the simulation engine completely.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.running = false
    console.log('[Simulator] Stopped')
  }

  /**
   * Pause the simulation (preserves state, stops tick loop).
   */
  pause(): void {
    if (!this.running) return
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.running = false
    console.log('[Simulator] Paused')
  }

  /**
   * Resume the simulation after a pause.
   */
  resume(): void {
    if (this.running) return
    this.running = true
    this.intervalId = setInterval(() => this.tick(), this.tickIntervalMs)
    console.log('[Simulator] Resumed')
  }

  /**
   * Execute one tick of the simulation for all patients.
   * For each patient: build OU params from baseline, apply scenario overrides,
   * run OU step, apply correlations, clamp, check anomalies, emit.
   */
  private tick(): void {
    const simTime = this.clock.getSimulatedTime()
    const simTimeMs = simTime.getTime()
    const recordedAt = new Date().toISOString() // Use actual wall-clock time per pitfall 5

    for (const patient of this.patients.values()) {
      // Check scenario expiry (using simulated time)
      if (patient.activeScenario && simTimeMs >= patient.activeScenario.expiresAt) {
        const scenarioName = patient.activeScenario.name
        patient.clearScenario()
        this.onEvent({
          type: 'scenario_ended',
          patientId: patient.patientId,
          patientName: patient.patientName,
          message: `${scenarioName} scenario ended for ${patient.patientName}`,
          timestamp: recordedAt,
        })
      }

      // Step 1: Generate each vital independently with OU process
      const rawReadings: Record<string, number> = {}

      for (const vitalType of VITAL_TYPES) {
        const baselineKey = BASELINE_KEY_MAP[vitalType]
        const baselineStat = patient.baseline[baselineKey]

        // Derive sigma from patient's baseline stdDev so OU noise scales per-patient
        const defaults = DEFAULT_OU_PARAMS[vitalType]
        const sigma = defaults.volatilityFraction * baselineStat.stdDev * Math.sqrt(2 * defaults.theta)

        const baseParams: OUParams = {
          theta: defaults.theta,
          mu: baselineStat.mean,
          sigma,
          dt: 1, // 1 tick unit
        }

        // Apply scenario overrides
        const effectiveParams = patient.getEffectiveParams(vitalType, baseParams)

        // OU step from current value
        const currentValue = patient.currentValues[vitalType as keyof typeof patient.currentValues]
        const newValue = ouStep(currentValue, effectiveParams)
        rawReadings[vitalType] = newValue
      }

      // Step 2: Apply cross-vital correlations
      const baselines: Record<string, { mean: number; stdDev: number }> = {}
      for (const vitalType of VITAL_TYPES) {
        const baselineKey = BASELINE_KEY_MAP[vitalType]
        baselines[vitalType] = patient.baseline[baselineKey]
      }
      const correlatedReadings = applyCorrelations(rawReadings, baselines)

      // Step 3: Clamp to physiological bounds
      for (const vitalType of VITAL_TYPES) {
        const clamped = clampVital(correlatedReadings[vitalType], vitalType)
        patient.currentValues[vitalType as keyof typeof patient.currentValues] = clamped
      }

      // Step 4: Check anomaly status (any vital beyond 2 stdDevs from baseline mean)
      const wasAnomaly = patient.isAnomaly
      let isNowAnomaly = false

      for (const vitalType of VITAL_TYPES) {
        const baselineKey = BASELINE_KEY_MAP[vitalType]
        const baselineStat = patient.baseline[baselineKey]
        const currentValue = patient.currentValues[vitalType as keyof typeof patient.currentValues]
        const deviation = Math.abs(currentValue - baselineStat.mean) / baselineStat.stdDev
        if (deviation > 2) {
          isNowAnomaly = true
          break
        }
      }

      patient.isAnomaly = isNowAnomaly

      // Step 5: Emit anomaly events on state transitions
      if (isNowAnomaly && !wasAnomaly) {
        this.onEvent({
          type: 'anomaly_started',
          patientId: patient.patientId,
          patientName: patient.patientName,
          message: `Anomalous vital signs detected for ${patient.patientName}`,
          timestamp: recordedAt,
        })
      } else if (!isNowAnomaly && wasAnomaly) {
        this.onEvent({
          type: 'anomaly_resolved',
          patientId: patient.patientId,
          patientName: patient.patientName,
          message: `Vital signs returned to normal for ${patient.patientName}`,
          timestamp: recordedAt,
        })
      }

      // Step 6: Emit the reading via callback
      const reading: VitalReadingPayload = {
        patientId: patient.patientId,
        heartRate:   Math.round(patient.currentValues.heartRate),
        bpSystolic:  Math.round(patient.currentValues.bpSystolic),
        bpDiastolic: Math.round(patient.currentValues.bpDiastolic),
        spo2:        Math.round(patient.currentValues.spo2 * 10) / 10,
        temperature: Math.round(patient.currentValues.temperature * 10) / 10,
        isAnomaly: patient.isAnomaly,
        recordedAt,
      }

      this.onReading(reading)
    }
  }

  /**
   * Add a patient to the simulation.
   */
  addPatient(id: number, name: string, baseline?: PatientBaseline): void {
    if (this.patients.has(id)) return
    const patientBaseline = baseline ?? getBaselines()[id] ?? getDefaultBaseline()
    const state = new PatientState(id, name, patientBaseline)
    this.patients.set(id, state)
    console.log(`[Simulator] Added patient ${name} (ID: ${id})`)
  }

  /**
   * Remove a patient from the simulation.
   */
  removePatient(id: number): void {
    const patient = this.patients.get(id)
    if (patient) {
      this.patients.delete(id)
      console.log(`[Simulator] Removed patient ${patient.patientName} (ID: ${id})`)
    }
  }

  /**
   * Sync the simulator with the current patient list from the database.
   * Adds new patients and removes deleted ones.
   */
  refreshPatients(patientList: Array<{ id: number; firstName: string; lastName: string }>): void {
    const activeIds = new Set(patientList.map(p => p.id))

    // Add new patients
    for (const p of patientList) {
      if (!this.patients.has(p.id)) {
        this.addPatient(p.id, `${p.firstName} ${p.lastName}`)
      }
    }

    // Remove deleted patients
    for (const id of this.patients.keys()) {
      if (!activeIds.has(id)) {
        this.removePatient(id)
      }
    }
  }

  /**
   * Apply a preset clinical scenario to a patient.
   * The scenario modifies OU parameters so vitals organically drift
   * into the scenario's target range. Duration is scaled by time speed.
   */
  applyScenario(patientId: number, scenarioId: ScenarioId): void {
    const patient = this.patients.get(patientId)
    if (!patient) return

    const scenario = SCENARIOS[scenarioId]
    if (!scenario) return

    // Scale scenario duration by time speed
    const simTime = this.clock.getSimulatedTime().getTime()
    const scaledDuration = scenario.durationMs // Duration in simulated time
    const expiresAt = simTime + scaledDuration

    patient.applyScenario(scenario, expiresAt)

    this.onEvent({
      type: 'scenario_started',
      patientId: patient.patientId,
      patientName: patient.patientName,
      message: `${scenario.name} scenario started for ${patient.patientName}`,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Reset a patient to their baseline values and clear any active scenario.
   */
  resetPatient(patientId: number): void {
    const patient = this.patients.get(patientId)
    if (!patient) return

    patient.resetToBaseline()
  }

  /**
   * Reset all patients to baseline.
   */
  resetAll(): void {
    for (const patient of this.patients.values()) {
      patient.resetToBaseline()
    }
  }

  /**
   * Get the full simulator status for the dev panel.
   */
  getStatus(): SimulatorStatus {
    const simTime = this.clock.getSimulatedTime()
    const simTimeMs = simTime.getTime()

    return {
      running: this.running,
      speed: this.clock.getSpeed(),
      simulatedTime: simTime.toISOString(),
      patientCount: this.patients.size,
      patients: Array.from(this.patients.values()).map(p => p.toSimState(simTimeMs)),
    }
  }

  /**
   * Check if the engine is currently running.
   */
  isRunning(): boolean {
    return this.running
  }
}
