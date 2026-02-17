// Preset clinical scenarios for the dev panel.
// Scenarios modify simulation parameters (OU process) so patients
// organically drift into concerning ranges -- no hardcoded value injection.
// Scenarios auto-resolve after their duration as mean reversion pulls vitals back.

import type { ScenarioId, ScenarioDefinition } from '@openpulse/shared'

export const SCENARIOS: Record<ScenarioId, ScenarioDefinition> = {
  bradycardia: {
    id: 'bradycardia',
    name: 'Bradycardia',
    description: 'Heart rate gradually drops below 60 bpm',
    durationMs: 3 * 60 * 1000, // 3 minutes
    parameterOverrides: {
      heartRate:   { muShift: -20, thetaMultiplier: 0.5 },  // Lower target, slow reversion
      bpSystolic:  { muShift: -8 },                          // Slight BP drop with bradycardia
    },
  },
  feverSpike: {
    id: 'feverSpike',
    name: 'Fever Spike',
    description: 'Temperature rises toward 38.5+, HR compensates upward',
    durationMs: 5 * 60 * 1000, // 5 minutes
    parameterOverrides: {
      temperature: { muShift: 1.5, sigmaMultiplier: 1.5 },
      heartRate:   { muShift: 15 },                           // Compensatory tachycardia
    },
  },
  desaturation: {
    id: 'desaturation',
    name: 'Desaturation',
    description: 'SpO2 gradually drops below 90%, HR rises to compensate',
    durationMs: 4 * 60 * 1000, // 4 minutes
    parameterOverrides: {
      spo2:        { muShift: -6, thetaMultiplier: 0.3 },    // Slow recovery
      heartRate:   { muShift: 20, sigmaMultiplier: 1.3 },    // Tachycardia compensation
    },
  },
  hypertensiveCrisis: {
    id: 'hypertensiveCrisis',
    name: 'Hypertensive Crisis',
    description: 'Blood pressure spikes significantly',
    durationMs: 4 * 60 * 1000, // 4 minutes
    parameterOverrides: {
      bpSystolic:  { muShift: 40, sigmaMultiplier: 1.5 },
      bpDiastolic: { muShift: 20, sigmaMultiplier: 1.3 },
      heartRate:   { muShift: 10 },
    },
  },
}

/**
 * Get a specific scenario by ID.
 */
export function getScenario(id: ScenarioId): ScenarioDefinition | undefined {
  return SCENARIOS[id]
}

/**
 * Get all available scenarios as an array.
 */
export function getAllScenarios(): ScenarioDefinition[] {
  return Object.values(SCENARIOS)
}
