import type { ThresholdLevel } from '@openpulse/shared'

/**
 * Friendly status phrases for each threshold level.
 * Communicates health status in patient-friendly, non-clinical language.
 */
export const STATUS_PHRASES: Record<ThresholdLevel | 'unknown', string> = {
  normal: 'Looking good',
  concerning: 'A little off — worth mentioning',
  critical: 'Please tell your nurse',
  unknown: 'Checking...',
}

/**
 * Action nudge for critical readings only.
 * Prompts patient to alert care team without causing panic.
 */
export const ACTION_NUDGE: Record<ThresholdLevel | 'unknown', string | undefined> = {
  normal: undefined,
  concerning: undefined,
  critical: 'Let your care team know',
  unknown: undefined,
}

/**
 * Card background and border tint classes per threshold level.
 * Warm palette equivalents with dark mode variants.
 * Clinical colors (emerald/amber/red) intentionally hardcoded — not CSS variables —
 * for WCAG dual encoding and clinical clarity across themes.
 */
export const CARD_TINT: Record<ThresholdLevel | 'unknown', string> = {
  normal: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50',
  concerning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50',
  critical: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50',
  unknown: 'bg-card border-border',
}

/**
 * Status phrase text color per threshold level.
 */
export const STATUS_TEXT_COLOR: Record<ThresholdLevel | 'unknown', string> = {
  normal: 'text-emerald-700 dark:text-emerald-400',
  concerning: 'text-amber-700 dark:text-amber-400',
  critical: 'text-red-700 dark:text-red-400',
  unknown: 'text-muted-foreground',
}

/**
 * Personal, friendly labels for each vital type shown in the patient portal.
 */
export const VITAL_LABELS = {
  heartRate: 'Your Heartbeat',
  bloodPressure: 'Your Blood Pressure',
  spo2: 'Your Oxygen',
  temperature: 'Your Temperature',
} as const
