import type { ChartConfig } from '@/components/ui/chart'

/**
 * Shared chart configuration for vital sign charts.
 * Used by Phase 4 (patient detail), Phase 5 (historical trends), Phase 7 (patient portal).
 */
export const vitalChartConfig = {
  heartRate: { label: 'Heart Rate', color: 'hsl(0, 84%, 60%)' },
  bpSystolic: { label: 'Systolic', color: 'hsl(262, 80%, 50%)' },
  bpDiastolic: { label: 'Diastolic', color: 'hsl(262, 60%, 70%)' },
  spo2: { label: 'SpO2', color: 'hsl(199, 89%, 48%)' },
  temperature: { label: 'Temperature', color: 'hsl(38, 92%, 50%)' },
} satisfies ChartConfig

/** Color tokens for threshold indicators on charts. */
export const thresholdColors = {
  normal: '#10b981',    // emerald-500
  concerning: '#f59e0b', // amber-500
  critical: '#ef4444',   // red-500
  line: '#94a3b8',       // slate-400 (reference line stroke)
} as const

/** Horizontal reference line definitions per vital type. */
export const hrThresholdLines = [
  { y: 50 },
  { y: 60 },
  { y: 100 },
  { y: 120 },
] as const

export const bpThresholdLines = [
  { y: 80 },
  { y: 90 },
  { y: 140 },
  { y: 160 },
] as const

export const spo2ThresholdLines = [
  { y: 90 },
  { y: 95 },
] as const

export const tempThresholdLines = [
  { y: 35 },
  { y: 36.1 },
  { y: 37.2 },
  { y: 38.5 },
] as const

/** Consistent Y-axis ranges per vital type. */
export const vitalYDomains = {
  heartRate: [30, 160] as [number, number],
  bpSystolic: [50, 200] as [number, number],
  spo2: [80, 100] as [number, number],
  temperature: [33, 41] as [number, number],
} as const

/** Muted colors for threshold zone background bands (5-7% opacity in usage). */
export const thresholdBandColors = {
  normal: '#10b981',      // emerald-500
  concerning: '#f59e0b',  // amber-500
  critical: '#ef4444',    // red-500
} as const

/** Band opacity — very subtle per user decision (5-10%). */
export const BAND_OPACITY = {
  normal: 0.06,
  concerning: 0.07,
  critical: 0.07,
} as const

/**
 * Threshold band zones per vital type.
 * Each zone: { y1, y2, level } where y1 < y2.
 * Zones stack to cover the full possible Y range.
 */
export const hrBands = [
  { y1: 0, y2: 50, level: 'critical' as const },
  { y1: 50, y2: 60, level: 'concerning' as const },
  { y1: 60, y2: 100, level: 'normal' as const },
  { y1: 100, y2: 120, level: 'concerning' as const },
  { y1: 120, y2: 250, level: 'critical' as const },
]

export const bpBands = [
  { y1: 0, y2: 80, level: 'critical' as const },
  { y1: 80, y2: 90, level: 'concerning' as const },
  { y1: 90, y2: 140, level: 'normal' as const },
  { y1: 140, y2: 160, level: 'concerning' as const },
  { y1: 160, y2: 250, level: 'critical' as const },
]

export const spo2Bands = [
  { y1: 0, y2: 90, level: 'critical' as const },
  { y1: 90, y2: 95, level: 'concerning' as const },
  { y1: 95, y2: 100, level: 'normal' as const },
]

export const tempBands = [
  { y1: 30, y2: 35, level: 'critical' as const },
  { y1: 35, y2: 36.1, level: 'concerning' as const },
  { y1: 36.1, y2: 37.2, level: 'normal' as const },
  { y1: 37.2, y2: 38.5, level: 'concerning' as const },
  { y1: 38.5, y2: 45, level: 'critical' as const },
]

/** Line colors for threshold zones — used in gradient stops. */
export const thresholdLineColors = {
  normal: '#10b981',
  concerning: '#f59e0b',
  critical: '#ef4444',
  unknown: '#94a3b8',
} as const

/** Compact relative time tick formatter for X-axis. */
export function compactRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const m = Math.round(diffMs / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  return `${d}d`
}
