import type { ThresholdLevel, VitalType } from '@openpulse/shared'

/**
 * Result of evaluating a vital sign against clinical threshold ranges.
 * Used by every visual component (badges, sparklines, card borders, charts).
 */
export interface ThresholdResult {
  level: ThresholdLevel | 'unknown'
  color: string
  bgClass: string
  textClass: string
  borderClass: string
  icon: 'CheckCircle2' | 'AlertTriangle' | 'XOctagon' | 'Minus'
}

type StatusEntry = Omit<ThresholdResult, 'level'>

/**
 * Visual property mapping for each threshold level.
 * Dual encoding: color (background) + icon (shape) per RTMON-09.
 */
export const STATUS_MAP: Record<ThresholdLevel | 'unknown', StatusEntry> = {
  normal: {
    color: 'emerald-500',
    bgClass: 'bg-emerald-500',
    textClass: 'text-white',
    borderClass: 'border-emerald-500',
    icon: 'CheckCircle2',
  },
  concerning: {
    color: 'amber-500',
    bgClass: 'bg-amber-500',
    textClass: 'text-white',
    borderClass: 'border-amber-500',
    icon: 'AlertTriangle',
  },
  critical: {
    color: 'red-500',
    bgClass: 'bg-red-500',
    textClass: 'text-white',
    borderClass: 'border-red-500',
    icon: 'XOctagon',
  },
  unknown: {
    color: 'gray-400',
    bgClass: 'bg-gray-400',
    textClass: 'text-white',
    borderClass: 'border-gray-400',
    icon: 'Minus',
  },
}

function result(level: ThresholdLevel | 'unknown'): ThresholdResult {
  return { level, ...STATUS_MAP[level] }
}

// ---------------------------------------------------------------------------
// Individual vital evaluators — clinical ranges per RTMON-05 through RTMON-08
// ---------------------------------------------------------------------------

/** RTMON-05: Heart rate (bpm) */
export function evaluateHeartRate(bpm: number | null): ThresholdResult {
  if (bpm === null || bpm === undefined) return result('unknown')
  if (bpm >= 60 && bpm <= 100) return result('normal')
  if ((bpm >= 50 && bpm < 60) || (bpm > 100 && bpm <= 120)) return result('concerning')
  return result('critical')
}

/** RTMON-06: Blood pressure systolic (mmHg) */
export function evaluateBPSystolic(systolic: number | null): ThresholdResult {
  if (systolic === null || systolic === undefined) return result('unknown')
  if (systolic >= 90 && systolic <= 140) return result('normal')
  if ((systolic >= 80 && systolic < 90) || (systolic > 140 && systolic <= 160)) return result('concerning')
  return result('critical')
}

/** Blood pressure diastolic (mmHg) — reasonable defaults when evaluated independently */
function evaluateBPDiastolic(diastolic: number | null): ThresholdResult {
  if (diastolic === null || diastolic === undefined) return result('unknown')
  if (diastolic >= 60 && diastolic <= 90) return result('normal')
  if ((diastolic >= 50 && diastolic < 60) || (diastolic > 90 && diastolic <= 100)) return result('concerning')
  return result('critical')
}

/** RTMON-07: Oxygen saturation (%) */
export function evaluateSpO2(spo2: number | null): ThresholdResult {
  if (spo2 === null || spo2 === undefined) return result('unknown')
  if (spo2 >= 95) return result('normal')
  if (spo2 >= 90) return result('concerning')
  return result('critical')
}

/** RTMON-08: Body temperature (Celsius) */
export function evaluateTemperature(temp: number | null): ThresholdResult {
  if (temp === null || temp === undefined) return result('unknown')
  if (temp >= 36.1 && temp <= 37.2) return result('normal')
  if ((temp >= 35 && temp < 36.1) || (temp > 37.2 && temp <= 38.5)) return result('concerning')
  return result('critical')
}

// ---------------------------------------------------------------------------
// Generic dispatcher + aggregation
// ---------------------------------------------------------------------------

/** Evaluate any vital type against its clinical thresholds. */
export function evaluateVital(type: VitalType, value: number | null): ThresholdResult {
  switch (type) {
    case 'heartRate':
      return evaluateHeartRate(value)
    case 'bpSystolic':
      return evaluateBPSystolic(value)
    case 'bpDiastolic':
      return evaluateBPDiastolic(value)
    case 'spo2':
      return evaluateSpO2(value)
    case 'temperature':
      return evaluateTemperature(value)
  }
}

const SEVERITY_ORDER: Record<ThresholdLevel | 'unknown', number> = {
  unknown: 0,
  normal: 1,
  concerning: 2,
  critical: 3,
}

/**
 * Return the worst (most severe) threshold result from a set.
 * Filters out unknown before comparison; if all unknown, returns unknown.
 */
export function worstOfFour(statuses: ThresholdResult[]): ThresholdResult {
  const known = statuses.filter((s) => s.level !== 'unknown')
  if (known.length === 0) return result('unknown')

  return known.reduce((worst, current) =>
    SEVERITY_ORDER[current.level] > SEVERITY_ORDER[worst.level] ? current : worst
  )
}
