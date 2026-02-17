// Patient baselines derived from seed patient conditions.
// Each patient's baselines reflect their clinical profile:
//   Patient 1 (Margaret, 85): hypertension + mild COPD
//   Patient 2 (Robert, 71): well-controlled type 2 diabetes
//   Patient 3 (Dorothy, 92): atrial fibrillation + osteoporosis
//   Patient 4 (James, 78): congestive heart failure (stable)
//   Patient 5 (Evelyn, 76): hypothyroidism
//   Patient 6 (Arthur, 81): post-stroke recovery + hypertension

import type { PatientBaseline } from '@openpulse/shared'

export const PATIENT_BASELINES: Record<number, PatientBaseline> = {
  1: {
    // Margaret Thompson - hypertension, mild COPD
    heartRate:   { mean: 78, stdDev: 8 },
    systolic:    { mean: 148, stdDev: 12 },
    diastolic:   { mean: 88, stdDev: 8 },
    spo2:        { mean: 93, stdDev: 2 },
    temperature: { mean: 36.6, stdDev: 0.3 },
  },
  2: {
    // Robert Chen - well-controlled type 2 diabetes
    heartRate:   { mean: 72, stdDev: 6 },
    systolic:    { mean: 128, stdDev: 10 },
    diastolic:   { mean: 78, stdDev: 6 },
    spo2:        { mean: 97, stdDev: 1.5 },
    temperature: { mean: 36.7, stdDev: 0.2 },
  },
  3: {
    // Dorothy Williams - atrial fibrillation (high HR stdDev for AF irregularity)
    heartRate:   { mean: 82, stdDev: 14 },
    systolic:    { mean: 118, stdDev: 10 },
    diastolic:   { mean: 68, stdDev: 7 },
    spo2:        { mean: 95, stdDev: 2 },
    temperature: { mean: 36.4, stdDev: 0.3 },
  },
  4: {
    // James O'Brien - congestive heart failure (stable)
    heartRate:   { mean: 88, stdDev: 10 },
    systolic:    { mean: 132, stdDev: 12 },
    diastolic:   { mean: 82, stdDev: 8 },
    spo2:        { mean: 93, stdDev: 2.5 },
    temperature: { mean: 36.5, stdDev: 0.2 },
  },
  5: {
    // Evelyn Kowalski - hypothyroidism (lower HR and temp)
    heartRate:   { mean: 62, stdDev: 5 },
    systolic:    { mean: 120, stdDev: 8 },
    diastolic:   { mean: 72, stdDev: 5 },
    spo2:        { mean: 97, stdDev: 1 },
    temperature: { mean: 36.0, stdDev: 0.3 },
  },
  6: {
    // Arthur Patel - post-stroke, hypertension
    heartRate:   { mean: 76, stdDev: 7 },
    systolic:    { mean: 145, stdDev: 14 },
    diastolic:   { mean: 85, stdDev: 9 },
    spo2:        { mean: 96, stdDev: 1.5 },
    temperature: { mean: 36.5, stdDev: 0.4 },
  },
}

/**
 * Get baselines for all known patients.
 * Future: could query DB for dynamic patients.
 */
export function getBaselines(): Record<number, PatientBaseline> {
  return PATIENT_BASELINES
}

/**
 * Get a generic elderly baseline for patients not in the hardcoded map.
 */
export function getDefaultBaseline(): PatientBaseline {
  return {
    heartRate:   { mean: 74, stdDev: 7 },
    systolic:    { mean: 130, stdDev: 10 },
    diastolic:   { mean: 80, stdDev: 7 },
    spo2:        { mean: 96, stdDev: 1.5 },
    temperature: { mean: 36.6, stdDev: 0.3 },
  }
}
