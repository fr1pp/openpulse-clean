// Cosine-based circadian modulation for vital signs
// Clinical research shows vital signs follow sinusoidal circadian patterns
// Source: PMC8063456 (Day-to-day progression of vital-sign circadian rhythms in the ICU)

interface CircadianConfig {
  peakHour: number     // Hour of day when vital is highest (0-23)
  amplitude: number    // Fraction of baseline to modulate (e.g., 0.10 = +/-10%)
}

export const CIRCADIAN_PROFILES: Record<string, CircadianConfig> = {
  heartRate:   { peakHour: 14, amplitude: 0.10 },  // HR peaks mid-afternoon
  bpSystolic:  { peakHour: 10, amplitude: 0.08 },  // BP peaks mid-morning
  bpDiastolic: { peakHour: 10, amplitude: 0.08 },  // Diastolic follows systolic
  spo2:        { peakHour: 14, amplitude: 0.02 },  // SpO2 has minimal variation
  temperature: { peakHour: 18, amplitude: 0.015 },  // Temp peaks late afternoon
}

/**
 * Apply circadian modulation to a baseline mean value.
 * Uses a cosine curve that peaks at peakHour and troughs 12 hours later.
 *
 * @param baselineMean - The patient's baseline mean for this vital
 * @param vitalType - One of: heartRate, bpSystolic, bpDiastolic, spo2, temperature
 * @param simulatedHour - Fractional hours (0-23.99)
 * @returns Modulated baseline mean
 */
export function applyCircadian(
  baselineMean: number,
  vitalType: string,
  simulatedHour: number
): number {
  const config = CIRCADIAN_PROFILES[vitalType]
  if (!config) return baselineMean

  // Cosine curve: peaks at peakHour, trough 12 hours later
  const phase = ((simulatedHour - config.peakHour) / 24) * 2 * Math.PI
  const modulation = 1 + config.amplitude * Math.cos(phase)
  return baselineMean * modulation
}
