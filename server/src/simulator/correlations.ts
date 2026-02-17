// Cross-vital correlation: after independently generating each vital,
// apply cross-vital influence so that abnormal readings in one vital
// affect others realistically.

interface Correlation {
  source: string       // Vital that influences
  target: string       // Vital being influenced
  coefficient: number  // How much deviation transfers (signed, normalized)
}

const CORRELATIONS: Correlation[] = [
  { source: 'heartRate', target: 'bpSystolic', coefficient: 0.3 },   // HR up -> BP up
  { source: 'heartRate', target: 'bpDiastolic', coefficient: 0.2 },  // HR up -> diastolic up
  { source: 'spo2', target: 'heartRate', coefficient: -0.4 },        // SpO2 down -> HR up (compensation)
  { source: 'temperature', target: 'heartRate', coefficient: 0.25 }, // Fever -> HR up
]

/**
 * Apply cross-vital correlations to a set of independently generated readings.
 * Shifts target vitals based on how far the source vital has deviated
 * from its baseline (measured in standard deviations).
 *
 * @param readings - Current raw readings (keyed by vital type)
 * @param baselines - Patient baselines with mean and stdDev per vital
 * @returns Adjusted readings with correlation effects applied
 */
export function applyCorrelations(
  readings: Record<string, number>,
  baselines: Record<string, { mean: number; stdDev: number }>
): Record<string, number> {
  const adjusted = { ...readings }

  for (const corr of CORRELATIONS) {
    const sourceBaseline = baselines[corr.source]
    const targetBaseline = baselines[corr.target]
    if (!sourceBaseline || !targetBaseline) continue

    // How many stdDevs the source has deviated from its mean
    const sourceDeviation = (readings[corr.source] - sourceBaseline.mean) / sourceBaseline.stdDev
    // Transfer a fraction of that deviation (in target's stdDev units) to the target
    adjusted[corr.target] += sourceDeviation * corr.coefficient * targetBaseline.stdDev
  }

  return adjusted
}
