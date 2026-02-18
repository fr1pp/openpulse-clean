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
