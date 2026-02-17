// Per-patient mutable simulation state.
// Tracks current vital values, active scenarios, and anomaly status.

import type { PatientBaseline, PatientSimState, ScenarioId, ScenarioDefinition } from '@openpulse/shared'
import type { OUParams } from './generators.js'
import { gaussianRandom } from './generators.js'

interface ActiveScenario {
  id: ScenarioId
  name: string
  expiresAt: number // simulated time in ms
  parameterOverrides: Record<string, { muShift?: number; sigmaMultiplier?: number; thetaMultiplier?: number }>
}

export class PatientState {
  patientId: number
  patientName: string
  currentValues: {
    heartRate: number
    bpSystolic: number
    bpDiastolic: number
    spo2: number
    temperature: number
  }
  baseline: PatientBaseline
  activeScenario: ActiveScenario | null = null
  isAnomaly: boolean = false

  constructor(patientId: number, patientName: string, baseline: PatientBaseline) {
    this.patientId = patientId
    this.patientName = patientName
    this.baseline = baseline

    // Initialize current values to baseline means with small random offset for diversity
    this.currentValues = {
      heartRate:   baseline.heartRate.mean + gaussianRandom() * baseline.heartRate.stdDev * 0.3,
      bpSystolic:  baseline.systolic.mean + gaussianRandom() * baseline.systolic.stdDev * 0.3,
      bpDiastolic: baseline.diastolic.mean + gaussianRandom() * baseline.diastolic.stdDev * 0.3,
      spo2:        baseline.spo2.mean + gaussianRandom() * baseline.spo2.stdDev * 0.3,
      temperature: baseline.temperature.mean + gaussianRandom() * baseline.temperature.stdDev * 0.3,
    }
  }

  /**
   * Apply a preset clinical scenario with parameter overrides.
   * Stores the full overrides so getEffectiveParams can apply them per vital.
   */
  applyScenario(scenario: ScenarioDefinition, expiresAtSimTime: number): void {
    this.activeScenario = {
      id: scenario.id,
      name: scenario.name,
      expiresAt: expiresAtSimTime,
      parameterOverrides: scenario.parameterOverrides,
    }
  }

  /**
   * Remove the active scenario (called when scenario duration expires).
   */
  clearScenario(): void {
    this.activeScenario = null
  }

  /**
   * Get effective OU parameters for a vital type, with scenario overrides applied.
   * Scenario overrides shift mu, multiply sigma and theta.
   */
  getEffectiveParams(vitalType: string, baseOU: OUParams): OUParams {
    if (!this.activeScenario) return baseOU

    const overrides = this.activeScenario.parameterOverrides[vitalType]
    if (!overrides) return baseOU

    return {
      theta: baseOU.theta * (overrides.thetaMultiplier ?? 1),
      mu: baseOU.mu + (overrides.muShift ?? 0),
      sigma: baseOU.sigma * (overrides.sigmaMultiplier ?? 1),
      dt: baseOU.dt,
    }
  }

  /**
   * Reset current values to baseline means and clear any active scenario.
   */
  resetToBaseline(): void {
    this.currentValues = {
      heartRate:   this.baseline.heartRate.mean,
      bpSystolic:  this.baseline.systolic.mean,
      bpDiastolic: this.baseline.diastolic.mean,
      spo2:        this.baseline.spo2.mean,
      temperature: this.baseline.temperature.mean,
    }
    this.activeScenario = null
    this.isAnomaly = false
  }

  /**
   * Serialize to a PatientSimState for dev panel display.
   */
  toSimState(currentSimTimeMs: number): PatientSimState {
    return {
      patientId: this.patientId,
      patientName: this.patientName,
      currentValues: { ...this.currentValues },
      activeScenario: this.activeScenario
        ? {
            id: this.activeScenario.id,
            name: this.activeScenario.name,
            remainingMs: Math.max(0, this.activeScenario.expiresAt - currentSimTimeMs),
          }
        : null,
      isAnomaly: this.isAnomaly,
    }
  }
}
